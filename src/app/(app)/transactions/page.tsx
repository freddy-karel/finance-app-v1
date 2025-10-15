"use client";
import { useState } from "react"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input";
import { createIncome } from "@/server/actions/transactions";
export default function TransactionsPage(){
  const [serviceId,setServiceId]=useState("");
  const [amount,setAmount]=useState(0);
  const [message,setMessage]=useState<string|null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await createIncome({ serviceId, amount });
      setMessage("Entrée enregistrée ✅");
      setServiceId(""); setAmount(0);
    }catch(e:any){ setMessage(e.message||"Erreur"); }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Entrées (recettes)</h2>
        <div className="text-sm text-muted">Ajouter une entrée rapide</div>
      </div>

      <form data-testid="income-form" onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-lg grid md:grid-cols-3 gap-4">
        <Input name="serviceId" label="Prestation (serviceId)" value={serviceId} onChange={e=>setServiceId(e.target.value)} />
        <Input name="amount" label="Montant" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
        <div className="flex items-end"><Button type="submit">Enregistrer</Button></div>
        {message && <div className="col-span-full text-sm text-muted">{message}</div>}
      </form>

      <div data-testid="journal" className="rounded-2xl bg-card p-6 shadow-lg">Journal du jour (à compléter)</div>
    </section>
  );
}
