"use server";
// Small re-exporting server actions to be imported into Client Components.
// Next requires server actions to be exported from a separate module (not defined inline in client files).

export async function createIncomeS(input:any){ const { createIncome } = await import("./transactions"); return createIncome(input); }
export async function createExpenseS(input:any){ const { createExpense } = await import("./transactions"); return createExpense(input); }

export async function listAnomaliesS(p:any){ const { listAnomalies } = await import("./anomalies"); return listAnomalies(p); }
export async function resolveAnomalyS(i:any){ const { resolveAnomaly } = await import("./anomalies"); return resolveAnomaly(i); }
export async function exportAnomaliesCSVS(p:any){ const { exportAnomaliesCSV } = await import("./anomalies"); return exportAnomaliesCSV(p); }

export async function getDaySummaryS(date:string){ const { getDaySummary } = await import("./distribution"); return getDaySummary({ date }); }
export async function getDistributionProposalS(date:string){ const { getDistributionProposal } = await import("./queries"); return getDistributionProposal({ date }); }
export async function distributeS(payload:any){ const { distribute } = await import("./distribution"); return distribute(payload); }
export async function reconcileS(payload:{declaredOnHand:number}){ const { reconcile } = await import("./distribution"); return reconcile(payload); }
export async function getEnvelopeBalancesS(){ const { getEnvelopeBalances } = await import("./queries"); return getEnvelopeBalances(); }

export async function listServicesS(){ const { listServices } = await import("./settings"); return listServices(); }
export async function upsertServiceS(input:any){ const { upsertService } = await import("./settings"); return upsertService(input); }
export async function toggleServiceS(input:any){ const { toggleService } = await import("./settings"); return toggleService(input); }

export async function listEnvelopesS(){ const { listEnvelopes } = await import("./settings"); return listEnvelopes(); }
export async function upsertEnvelopeS(input:any){ const { upsertEnvelope } = await import("./settings"); return upsertEnvelope(input); }
export async function toggleEnvelopeActiveS(input:any){ const { toggleEnvelopeActive } = await import("./settings"); return toggleEnvelopeActive(input); }
export async function toggleEnvelopeProtectedS(input:any){ const { toggleEnvelopeProtected } = await import("./settings"); return toggleEnvelopeProtected(input); }

export async function getActiveRuleS(){ const { getActiveRule } = await import("./settings"); return getActiveRule(); }
export async function updateDistributionRuleS(items:any){ const { updateDistributionRule } = await import("./settings"); return updateDistributionRule(items); }
export async function listChargeTypesS(){ const { listChargeTypes } = await import("./settings"); return listChargeTypes(); }
export async function createChargeTypeS(input:any){ const { createChargeType } = await import("./settings"); return createChargeType(input); }
export async function updateChargeTypeS(input:any){ const { updateChargeType } = await import("./settings"); return updateChargeType(input); }
export async function deleteChargeTypeS(input:any){ const { deleteChargeType } = await import("./settings"); return deleteChargeType(input); }
export async function computeReferenceS(input:any){ const { computeReference } = await import("./reference"); return computeReference(input); }
export async function adoptSuggestedRuleS(input:any){ const { adoptSuggestedRule } = await import("./reference"); return adoptSuggestedRule(input); }
export async function createExpenseFormS(formData: FormData){ const { createExpenseForm } = await import("./transactions"); return createExpenseForm(formData); }
