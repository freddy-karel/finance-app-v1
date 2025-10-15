import { getEnvelopeBalances } from "@/server/actions/queries";
import { formatAmount } from "@/lib/utils";

export const revalidate = 60;

export default async function DashboardPage() {
  const balances = await getEnvelopeBalances();
  const total = balances.reduce((s: number, b: any) => s + Number(b.balance || 0), 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="text-sm text-muted">Vue d'ensemble de vos finances</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-card p-6 shadow-lg flex flex-col justify-center">
          <div className="text-sm text-muted">Solde total</div>
          <div className="text-4xl font-bold mt-2">{formatAmount(total)}</div>
        </div>

        <div className="md:col-span-2 rounded-2xl bg-card p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Enveloppes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {balances.map((b: any) => (
              <div key={b.envelopeId} className="rounded-xl bg-surface p-4 shadow-card">
                <div className="text-sm text-muted">{b.name}</div>
                <div className="text-2xl font-medium mt-2">{formatAmount(b.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
