"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/lib/utils";
import { getEnvelopeBalancesS } from "@/server/actions/proxies";

type Row = { envelopeId: string; amount: number };
type Env = { envelopeId:string; name:string; balance:number; protected:boolean; active:boolean };

export default function ExpensesClient(){
  const [envs,setEnvs]=useState<Env[]>([]);
  const [allocs,setAllocs]=useState<Row[]>([{ envelopeId:"", amount:0 }]);
  const [override,setOverride]=useState(false);
  const [reason,setReason]=useState("");
  const [message,setMessage]=useState<string|null>(null);
  // No more payloadRef: we use structured form inputs

  useEffect(()=>{ (async()=>{ const rows = await getEnvelopeBalancesS(); setEnvs(rows as Env[]); })(); },[]);

  const total = useMemo(()=> allocs.reduce((s,a)=> s + Number(a.amount||0), 0), [allocs]);
  const map = useMemo(()=> new Map(envs.map(e=>[e.envelopeId, e])), [envs]);

  const issues = useMemo(()=>{
    return allocs.map(a=>{
      const env = map.get(a.envelopeId);
      const warn: string[] = [];
      if(!env) return { warn: ["Choisissez une enveloppe valide"], level: "warning" as const };
      if(!env.active) warn.push(`Enveloppe '${env.name}' inactive`);
      if(env.protected && !override) warn.push(`Enveloppe '${env.name}' protégée — dérogation requise`);
      if(a.amount>0 && a.amount > (env.balance ?? 0) && !override) warn.push(`Dépassement (${formatAmount(a.amount)} > solde ${formatAmount(env.balance)})`);
      return { warn, level: warn.length ? "warning" as const : "ok" as const };
    });
  }, [allocs, map, override]);

  const hasBlocking = useMemo(()=> issues.some(i=> i.level==="warning"), [issues]);

  const addRow = () => setAllocs([...allocs, { envelopeId:"", amount:0 }]);
  const update = (i:number, k: keyof Row, v:any) => { const c=[...allocs]; (c as any)[i][k] = k==="amount" ? Number(v) : v; setAllocs(c); };

  // nothing here — form fields are rendered directly below

  return (
    <div>
      <section className="space-y-4">
        {allocs.map((a,i)=>{
          const env = map.get(a.envelopeId);
          const warn = issues[i]?.warn ?? [];
          const canShowBalance = !!env && env.active;
          const balance = env?.balance ?? 0;
          const isOver = a.amount>0 && a.amount>balance;
          return (
            <div key={i} className="rounded-xl bg-surface p-4 space-y-2">
              <div className="grid md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-sm text-white/90" htmlFor={`env-select-${i}`}>Enveloppe</label>
                  <select id={`env-select-${i}`} name={`allocations[${i}].envelopeId`} aria-label={`Enveloppe ${i+1}`} className="w-full rounded-xl bg-surface border border-white/10 h-10 px-3" value={a.envelopeId} onChange={e=>update(i,"envelopeId",e.target.value)}>
                    <option value="">— Choisir —</option>
                    {envs.filter(e=> e.active).map(e=> (
                      <option key={e.envelopeId} value={e.envelopeId}>{e.name}{e.protected?" (protégée)":""}</option>
                    ))}
                  </select>
                </div>
                <Input label="Montant" name={`allocations[${i}].amount`} type="number" value={a.amount} onChange={e=>update(i,"amount",e.target.value)} />
                {i===0 ? <Button type="button" variant="ghost" onClick={addRow}>+ Ajouter</Button> : <div/>}
              </div>
              <div className="text-sm">
                {canShowBalance ? (
                  <span className="text-white/80">
                    Solde disponible : <b>{formatAmount(balance)}</b>
                    {env?.protected ? " — Enveloppe protégée" : ""}
                    {isOver && !override ? (<span className="ml-2 text-danger">• Dépassement</span>) : null}
                  </span>
                ) : (
                  <span className="text-white/60">Sélectionnez une enveloppe pour voir le solde disponible</span>
                )}
              </div>
              {warn.length>0 && (<ul className="text-sm text-yellow-300/90 list-disc pl-5">{warn.map((w,idx)=>(<li key={idx}>{w}</li>))}</ul>)}
            </div>
          );
        })}

        <div className="grid md:grid-cols-3 gap-3 items-end">
          <Input label="Total (auto)" name="total" value={total} readOnly />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="allowOverride" checked={override} onChange={e=>setOverride(e.target.checked)} /> Autoriser dérogation</label>
          <Input label="Raison (si dérogation)" name="overrideReason" value={reason} onChange={e=>setReason(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={hasBlocking && !override} aria-disabled={hasBlocking && !override}>Valider la dépense</Button>
          {hasBlocking && !override && (<span className="text-sm text-yellow-300/90">Des avertissements bloquants sont présents. Activez la dérogation avec un motif pour confirmer malgré tout.</span>)}
        </div>
      </section>
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}
