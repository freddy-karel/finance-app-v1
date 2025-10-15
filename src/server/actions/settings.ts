"use server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UpdateDistributionRuleSchema, UpsertEnvelopeSchema, ToggleEnvelopeActiveSchema, ToggleEnvelopeProtectedSchema, UpsertServiceSchema, ToggleServiceSchema } from "@/server/validators/settings";
import { getActiveDistributionRule as _get } from "@/server/queries/rules";
import { TypePoliciesSchema } from "@/server/validators/policies";
import { z } from "zod";

export async function updateDistributionRule(items:{envelopeId:string;percent:number}[]){
  await requireRole(["manager"]);
  const parsed=UpdateDistributionRuleSchema.safeParse({items}); if(!parsed.success) throw new Error(parsed.error.errors.map(e=>e.message).join("; "));
  const ids=parsed.data.items.map(i=>i.envelopeId);
  const envs=await prisma.envelope.findMany({ where:{ id:{ in:ids } } });
  if(envs.length!==ids.length) throw new Error("Certaines enveloppes n'existent pas");
  if(envs.some(e=>!e.active)) throw new Error("Certaines enveloppes sont inactives");
  const now=new Date();
  await prisma.distributionRule.updateMany({ where:{ startsAt:{ lte:now }, OR:[{endsAt:null},{endsAt:{gt:now}}] }, data:{ endsAt:now } });
  const rule=await prisma.distributionRule.create({ data:{ startsAt: now } });
  await prisma.distributionRuleItem.createMany({ data: parsed.data.items.map(i=>({ ruleId:rule.id, envelopeId:i.envelopeId, percent:i.percent })) });
  return { ruleId: rule.id };
}
export async function listEnvelopes(){ await requireRole(["operator","manager","auditor"]); return prisma.envelope.findMany({ orderBy:{ createdAt:"asc" }, include:{ type:true } }); }
export async function listServices(){ await requireRole(["operator","manager","auditor"]); return prisma.service.findMany({ orderBy:{ createdAt:"asc" } }); }
export async function getActiveRule(){ await requireRole(["operator","manager","auditor"]); const r=await _get(); if(!r) return null; return { id:r.id, startsAt:r.startsAt, endsAt:r.endsAt??null, items:r.items.map(i=>({ envelopeId:i.envelopeId, percent:i.percent, envelopeName:i.envelope.name })) }; }
export async function listRulesHistory(){ await requireRole(["operator","manager","auditor"]); const rs=await prisma.distributionRule.findMany({ include:{ items:{ include:{ envelope:true } } }, orderBy:{ startsAt:"desc" } }); return rs.map(r=>({ id:r.id, startsAt:r.startsAt, endsAt:r.endsAt??null, items:r.items.map(i=>({ envelopeId:i.envelopeId, percent:i.percent, envelopeName:i.envelope.name })) })); }
export async function upsertEnvelope(input:{id?:string;name:string;emoji?:string;protected?:boolean;active?:boolean; typeId?:string}){
  await requireRole(["manager"]);
  const p=UpsertEnvelopeSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; "));
  const data:any = { name:p.data.name, emoji:p.data.emoji??null, protected:p.data.protected??false, active:p.data.active??true };
  if((input as any).typeId) data.typeId = (input as any).typeId ?? null;
  if(p.data.id) return prisma.envelope.update({ where:{ id:p.data.id }, data }); return prisma.envelope.create({ data });
}
export async function toggleEnvelopeActive(input:{id:string;active:boolean}){ await requireRole(["manager"]); const p=ToggleEnvelopeActiveSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; ")); return prisma.envelope.update({ where:{ id:p.data.id }, data:{ active:p.data.active } }); }
export async function toggleEnvelopeProtected(input:{id:string;protected:boolean}){ await requireRole(["manager"]); const p=ToggleEnvelopeProtectedSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; ")); return prisma.envelope.update({ where:{ id:p.data.id }, data:{ protected:p.data.protected } }); }
export async function upsertService(input:{id?:string;name:string;active?:boolean}){ await requireRole(["manager"]); const p=UpsertServiceSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; ")); const data={ name:p.data.name, active:p.data.active??true }; if(p.data.id) return prisma.service.update({ where:{ id:p.data.id }, data }); return prisma.service.create({ data }); }
export async function toggleService(input:{id:string;active:boolean}){ await requireRole(["manager"]); const p=ToggleServiceSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; ")); return prisma.service.update({ where:{ id:p.data.id }, data:{ active:p.data.active } }); }

// ChargeType CRUD
const ChargeTypeCreateSchema = z.object({ code: z.string().min(2), name: z.string().min(2), policies: TypePoliciesSchema.partial().optional(), });
const ChargeTypeUpdateSchema = z.object({ id: z.string().min(1), name: z.string().min(2).optional(), policies: TypePoliciesSchema.partial().optional(), });

export async function listChargeTypes(){ await requireRole(["manager","auditor","operator"]); return prisma.chargeType.findMany({ orderBy:{ createdAt: "desc" } }); }

export async function createChargeType(input:{code:string; name:string; policies?:any}){
  await requireRole(["manager"]);
  const p = ChargeTypeCreateSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; "));
  const policies = p.data.policies ? TypePoliciesSchema.parse(p.data.policies) : undefined;
  return prisma.chargeType.create({ data: { code: p.data.code, name: p.data.name, policies } });
}

export async function updateChargeType(input:{id:string; name?:string; policies?:any}){
  await requireRole(["manager"]);
  const p = ChargeTypeUpdateSchema.safeParse(input); if(!p.success) throw new Error(p.error.errors.map(e=>e.message).join("; "));
  const data:any = {};
  if(p.data.name) data.name = p.data.name;
  if(p.data.policies) data.policies = TypePoliciesSchema.parse(p.data.policies);
  return prisma.chargeType.update({ where: { id: p.data.id }, data });
}

export async function deleteChargeType(input:{id:string}){
  await requireRole(["manager"]);
  const { id } = input;
  const count = await prisma.envelope.count({ where: { /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ //@ts-ignore
    // typeId property may not exist in generated types until prisma generate runs
    // but is valid at runtime after migration
    // @ts-ignore
    typeId: id } });
  if(count>0) throw new Error("Ce type est utilisé par des enveloppes. Détachez-les avant suppression.");
  await prisma.chargeType.delete({ where: { id } });
  return { ok:true };
}
