"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { CreateIncomeSchema, CreateExpenseSchema } from "@/server/validators/transactions";
import { getAllEnvelopeBalances } from "@/server/queries/envelopes";
import { TypePoliciesSchema } from "@/server/validators/policies";
import type { AnomalyListItem } from "@/server/types";

export async function createIncome(input:{serviceId:string;amount:number;note?:string}){
  await requireRole(["operator","manager"]);
  const parsed=CreateIncomeSchema.safeParse(input); if(!parsed.success) throw new Error(parsed.error.errors.map(e=>e.message).join("; "));
  const tx=await prisma.transaction.create({ data:{ kind:"IN", label:"Entrée", amount:parsed.data.amount, at:new Date(), serviceId:parsed.data.serviceId } });
  return { transactionId: tx.id };
}

export async function createExpense(input:{ total:number; allocations:{ envelopeId:string; amount:number }[]; allowOverride?:boolean; overrideReason?:string }){
  await requireRole(["operator","manager"]);
  const parsed=CreateExpenseSchema.safeParse(input); if(!parsed.success) throw new Error(parsed.error.errors.map(e=>e.message).join("; "));
  // Charger enveloppes + type/policies pour validations par type
  const envIds = parsed.data.allocations.map((a:any)=> a.envelopeId);
  // use prisma as any to select the related type (Prisma client needs generating after migration)
  const envWithTypes = await prisma.envelope.findMany({ where: { id: { in: envIds } }, select: { id:true, name:true, protected:true, active:true, type:{ select:{ id:true, code:true, name:true, policies:true } } } });
  const map = new Map(envWithTypes.map((e:any)=>[e.id, e]));

  // Rôle courant (pour politique requireManagerForOverride)
  const role = await (async()=> {
    try{ const { getCurrentRole } = await import("@/lib/auth"); return await getCurrentRole(); }catch{ return "operator"; }
  })();

  // Vérifs par type d’enveloppe
  for(const a of parsed.data.allocations){
    const e:any = map.get(a.envelopeId as string);
    if(!e) throw new Error("Enveloppe inconnue");
    const pol = e.type?.policies ? TypePoliciesSchema.parse(e.type.policies) : undefined;
    if(pol?.forbidOut){
      if(!parsed.data.allowOverride){
        await prisma.anomaly.create({ data:{ level: "critical", code: "TYPE_FORBID_OUT", details: `Dépense interdite sur enveloppe de type '${e.type?.code ?? "?"}' (${e.name})` } });
        throw new Error(`Dépense interdite par la politique du type '${e.type?.name ?? e.type?.code}'.`);
      }
      if(pol.requireManagerForOverride && role!="manager"){
        await prisma.anomaly.create({ data:{ level: "critical", code: "TYPE_FORBID_OUT_NEEDS_MANAGER", details: `Dérogation réservée au manager pour '${e.name}'` } });
        throw new Error("Dérogation réservée au manager pour ce type d’enveloppe.");
      }
    } else if(pol?.requireOverrideForOut){
      if(!parsed.data.allowOverride){
        await prisma.anomaly.create({ data:{ level: "warning", code: "TYPE_REQUIRE_OVERRIDE_OUT", details: `Dérogation obligatoire pour '${e.name}'` } });
        throw new Error(`Dérogation obligatoire pour le type '${e.type?.name ?? e.type?.code}'.`);
      }
      if(pol.requireManagerForOverride && role!="manager"){
        await prisma.anomaly.create({ data:{ level: "critical", code: "TYPE_REQUIRE_OVERRIDE_OUT_NEEDS_MANAGER", details: `Dérogation réservée manager pour '${e.name}'` } });
        throw new Error("Dérogation réservée au manager pour ce type d’enveloppe.");
      }
    }
  }
  const balances = await getAllEnvelopeBalances();
  const envs = envWithTypes.map((e:any)=>({ id:e.id, name:e.name, protected:e.protected, active:e.active }));
  type Env = { id:string; name:string; protected:boolean; active:boolean };
  type Bal = { envelopeId:string; balance:number };
  const envMap=new Map((envs as Env[]).map((e:Env)=>[e.id,e]));
  const balMap=new Map((balances as Bal[]).map((b:Bal)=>[b.envelopeId,b.balance]));
  const anomalies: {level:"critical"|"warning"; code:string; details:string}[] = [];
  for(const a of parsed.data.allocations){
    const env = envMap.get(a.envelopeId) as Env | undefined;
    if(!env) throw new Error("Enveloppe inconnue");
    if(!env.active) throw new Error(`Enveloppe ${env.name} inactive`);
    const available = balMap.get(a.envelopeId) ?? 0;
    if(env.protected && !parsed.data.allowOverride) throw new Error(`Enveloppe protégée (${env.name}) — dérogation requise`);
    if(env.protected && parsed.data.allowOverride) anomalies.push({ level:"critical", code:"PROTECTED_ENVELOPE_USED", details:`Dépense sur enveloppe protégée (${env.name})` });
    if(a.amount > available){
      if(!parsed.data.allowOverride) throw new Error(`Allocation > solde (${env.name})`);
      anomalies.push({ level:"warning", code:"NEGATIVE_BALANCE", details:`Allocation ${a.amount} > solde ${available} sur ${env.name}` });
    }
  }
  const tx=await prisma.transaction.create({ data:{ kind:"OUT", label:"Dépense", amount:parsed.data.total, at:new Date() } });
  await prisma.transactionAllocation.createMany({ data: parsed.data.allocations.map(a=>({ transactionId:tx.id, envelopeId:a.envelopeId, amount:a.amount })) });
  if(anomalies.length){ await prisma.anomaly.createMany({ data: anomalies.map(an=>({ level:an.level, code:an.code, details: parsed.data.overrideReason?`${an.details} — Raison: ${parsed.data.overrideReason}`:an.details, transactionId:tx.id })) }); }
  return { transactionId: tx.id, anomalies };
}

// Adapter to accept a FormData from a form[action] submission.
export async function createExpenseForm(formData: FormData){
  // Parse structured form fields:
  // total, allowOverride, overrideReason, allocations[i].envelopeId, allocations[i].amount
  const totalRaw = formData.get('total');
  const total = totalRaw ? Number(totalRaw) : 0;
  const allowOverride = formData.get('allowOverride') === 'on' || formData.get('allowOverride') === 'true';
  const overrideReason = String(formData.get('overrideReason') ?? "");

  // Collect allocations by scanning keys like allocations[0].envelopeId and allocations[0].amount
  const allocations: { envelopeId:string; amount:number }[] = [];
  for(const key of Array.from(formData.keys())){
    const m = key.match(/^allocations\[(\d+)\]\.(envelopeId|amount)$/);
    if(m){
      const idx = Number(m[1]);
      const field = m[2];
      allocations[idx] = allocations[idx] ?? { envelopeId: "", amount: 0 };
      const val = formData.get(key);
      if(field === 'envelopeId') allocations[idx].envelopeId = String(val ?? "");
      if(field === 'amount') allocations[idx].amount = Number(val ?? 0);
    }
  }

  // Filter out empty allocation slots
  const allocsFiltered = allocations.filter(a => a && a.envelopeId && Number(a.amount) > 0);

  const input = { total, allocations: allocsFiltered, allowOverride, overrideReason };
  return createExpense(input);
}
