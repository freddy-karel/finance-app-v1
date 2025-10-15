"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listEnvelopesS, getActiveRuleS, updateDistributionRuleS } from "@/server/actions/proxies";

export default function DistributionSettingsPage() {
  const [envs, setEnvs] = useState<any[]>([]);
  const [rows, setRows] = useState<{ envelopeId: string; percent: number }[]>([]);

  const load = async () => {
    const E = await listEnvelopesS();
    setEnvs(E);
    const rule = await getActiveRuleS();
    setRows(rule?.items ?? E.slice(0, 3).map((e: any) => ({ envelopeId: e.id, percent: Math.floor(100 / Math.max(1, Math.min(3, E.length))) })));
  };

  useEffect(() => { load(); }, []);

  const update = (i: number, k: "envelopeId" | "percent", v: any) => { const c = [...rows]; (c as any)[i][k] = k === "percent" ? Number(v) : v; setRows(c); };
  const addRow = () => setRows([...rows, { envelopeId: "", percent: 0 }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDistributionRuleS(rows);
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Règle de répartition (100%)</h2>
        <div className="text-sm text-muted">Affectation automatique des recettes</div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-lg space-y-4">
        {rows.map((r, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-4 items-end">
            <Input label="Enveloppe (id)" value={r.envelopeId} onChange={e => update(i, "envelopeId", e.target.value)} />
            <Input label="Pourcentage (%)" type="number" value={r.percent} onChange={e => update(i, "percent", e.target.value)} />
            <div className="flex justify-end">{i === 0 ? <Button type="button" variant="ghost" onClick={addRow}>+ Ajouter</Button> : null}</div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="submit">Valider la nouvelle règle</Button>
        </div>
      </form>
    </section>
  );
}
