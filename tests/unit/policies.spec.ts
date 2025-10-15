import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createChargeType, createChargeType as _createChargeType } from '@/server/actions/settings';
import { createExpense } from '@/server/actions/transactions';

// We'll use direct prisma calls to seed the DB for tests

describe('ChargeType policies (integration-like)', () => {
  beforeEach(async () => {
    // clean DB (guard against missing tables in some test envs)
    try{ await prisma.transactionAllocation.deleteMany(); }catch(e){}
    try{ await prisma.transaction.deleteMany(); }catch(e){}
    try{ await prisma.anomaly.deleteMany(); }catch(e){}
    try{ await prisma.chargeType.deleteMany(); }catch(e){}
    try{ await prisma.envelope.deleteMany(); }catch(e){}
  });

  it('blocks OUT when forbidOut policy is set', async () => {
    const type = await prisma.chargeType.create({ data: { code: 'LOYER', name: 'Loyer', policies: { forbidOut: true } } });
    const env = await prisma.envelope.create({ data: { name: 'Loyer', emoji: '🏠', protected: false, active: true, typeId: type.id } });
    await expect(createExpense({ total: 100, allocations: [{ envelopeId: env.id, amount: 100 }], allowOverride: false })).rejects.toThrow();
  });

  it('requires override when requireOverrideForOut is set', async () => {
    const type = await prisma.chargeType.create({ data: { code: 'SUB', name: 'Subscription', policies: { requireOverrideForOut: true } } });
    const env = await prisma.envelope.create({ data: { name: 'Sub', emoji: '💳', protected: false, active: true, typeId: type.id } });
    await expect(createExpense({ total: 50, allocations: [{ envelopeId: env.id, amount: 50 }], allowOverride: false })).rejects.toThrow();
  });
});
