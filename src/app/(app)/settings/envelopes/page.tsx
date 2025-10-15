"use client";
import { useEffect, useMemo, useState } from "react"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { listEnvelopesS, upsertEnvelopeS, toggleEnvelopeActiveS, toggleEnvelopeProtectedS, listChargeTypesS } from '@/server/actions/proxies';
export default function EnvelopesSettingsPage(){
  const [rows,setRows]=useState<any[]>([]); const [name,setName] = useState(""); const [emoji,setEmoji]=useState(""); const [prot,setProt]=useState(false);
  const [typeId,setTypeId]=useState<string>(""); const [types,setTypes]=useState<any[]>([]);
  const load=async()=>{ const [r,t] = await Promise.all([listEnvelopesS(), listChargeTypesS()]); setRows(r as any[]); setTypes(t as any[]); };
  useEffect(()=>{ load(); },[]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertEnvelopeS({ name, emoji, protected:prot, typeId: typeId || undefined }); setName(""); setEmoji(""); setProt(false); setTypeId(""); await load();
  };

  return <section className="space-y-4"><h2 className="text-xl font-semibold">Enveloppes</h2>
    <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-4 shadow-card grid md:grid-cols-5 gap-3">
      <Input label="Nom" value={name} onChange={e=>setName(e.target.value)} /><Input label="Emoji" value={emoji} onChange={e=>setEmoji(e.target.value)} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={prot} onChange={e=>setProt(e.target.checked)} /> Protégée</label>
      <div className="space-y-1">
        <label className="text-sm text-white/90">Type</label>
        <select className="w-full rounded-xl bg-surface border border-white/10 h-10 px-3" value={typeId} onChange={e=>setTypeId(e.target.value)}>
          <option value="">— Aucun —</option>
          {types.map((t:any)=> <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
        </select>
      </div>
      <Button type="submit">Ajouter</Button>
    </form>
    <div className="space-y-2">{rows.map(r=>(<div key={r.id} className="rounded-2xl bg-card p-4 shadow-card grid md:grid-cols-5 gap-3 items-center">
      <div>{r.emoji} {r.name} <span className="text-white/60 text-xs">{r.type?.name?`• ${r.type.name}` : ""}</span></div><div>Protégée: {r.protected?"oui":"non"}</div><div>Active: {r.active?"oui":"non"}</div>
      <Button variant="ghost" onClick={async()=>{ await toggleEnvelopeProtectedS({ id:r.id, protected:!r.protected }); await load(); }}>{r.protected?"Déprotéger":"Protéger"}</Button>
      <Button variant="ghost" onClick={async()=>{ await toggleEnvelopeActiveS({ id:r.id, active:!r.active }); await load(); }}>{r.active?"Désactiver":"Activer"}</Button>
    </div>))}</div></section>;
}
