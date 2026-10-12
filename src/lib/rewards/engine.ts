import crypto from 'crypto';
import { Reward } from '../types';

export interface AllocationResult {
  reward: Reward;
  modeUsed: 'weighted_random' | 'fixed_inventory' | 'fallback' | 'batch_quota';
}

export interface BatchQuotaContext {
  batchSize?: number;
  cycleIssued?: Record<string, number>;
}

/**
 * Cryptographically secure float between 0 and 1
 */
function secureRandomFloat(): number {
  const buffer = crypto.randomBytes(4);
  const intVal = buffer.readUInt32BE(0);
  return intVal / 0xffffffff;
}

/**
 * Normalize reward id across UUID, cmp- prefix, or rew- legacy ids
 */
function normalizeRewardId(id: string): string {
  if (!id) return '';
  const clean = id.replace(/^cmp-/, '');
  const REWARD_MAP: Record<string, string> = {
    'rew-001': '33333333-3333-3333-3333-000000000001',
    'rew-002': '33333333-3333-3333-3333-000000000002',
    'rew-003': '33333333-3333-3333-3333-000000000003',
    'rew-004': '33333333-3333-3333-3333-000000000004',
    'rew-005': '33333333-3333-3333-3333-000000000005',
    'rew-006': '33333333-3333-3333-3333-000000000006',
    'rew-007': '33333333-3333-3333-3333-000000000007',
    'rew-008': '33333333-3333-3333-3333-000000000008',
  };
  return REWARD_MAP[clean] || clean;
}

/**
 * Server-side Reward Allocation Engine
 * Supports 100-user Batch Quota (e.g. exactly 90 Free Frames per 100 customers)
 * as well as mathematical weighted random.
 */
export function allocateReward(
  availableRewards: Reward[],
  mode: 'weighted_random' | 'fixed_inventory' | 'fixed_reward' | 'batch_quota' = 'batch_quota',
  quotaContext?: BatchQuotaContext
): AllocationResult | null {
  // Filter active rewards with remaining inventory
  const inStockRewards = availableRewards.filter(
    (r) => r.isActive && r.totalInventory - r.issuedCount > 0
  );

  if (inStockRewards.length === 0) {
    return null;
  }

  // Batch Quota Mode: Ensures per-cycle quota (e.g., exactly 90 out of 100 customers)
  if (mode === 'batch_quota' && quotaContext?.cycleIssued !== undefined) {
    const batchSize = quotaContext.batchSize || 100;
    const cycleIssued = quotaContext.cycleIssued || {};
    const totalConfiguredProb = inStockRewards.reduce((sum, r) => sum + r.probabilityPercent, 0);

    if (totalConfiguredProb > 0) {
      // 1. Calculate each reward's exact ticket quota out of `batchSize`
      const highestProbReward = inStockRewards.reduce((prev, curr) => 
        curr.probabilityPercent > prev.probabilityPercent ? curr : prev, inStockRewards[0]
      );

      let quotas: { reward: Reward; quota: number }[];

      if (highestProbReward.probabilityPercent >= 50) {
        // Guarantee top reward receives its exact specified count (e.g. 90 out of 100)
        const topQuota = Math.min(batchSize, Math.round(highestProbReward.probabilityPercent));
        const remainingBatch = Math.max(0, batchSize - topQuota);
        const otherRewards = inStockRewards.filter(r => r.id !== highestProbReward.id);
        const otherProbSum = otherRewards.reduce((s, r) => s + r.probabilityPercent, 0);

        let otherQuotas = otherRewards.map(r => ({
          reward: r,
          quota: otherProbSum > 0 ? Math.round((r.probabilityPercent / otherProbSum) * remainingBatch) : 0,
        }));

        let allocatedOther = otherQuotas.reduce((s, q) => s + q.quota, 0);
        let otherDiff = remainingBatch - allocatedOther;
        if (otherDiff !== 0 && otherQuotas.length > 0) {
          // Adjust last non-zero quota to balance exactly
          for (let i = otherQuotas.length - 1; i >= 0; i--) {
            if (otherQuotas[i].quota + otherDiff >= 0) {
              otherQuotas[i].quota += otherDiff;
              otherDiff = 0;
              break;
            }
          }
        }

        quotas = [
          { reward: highestProbReward, quota: topQuota },
          ...otherQuotas,
        ];
      } else {
        quotas = inStockRewards.map(r => ({
          reward: r,
          quota: Math.round((r.probabilityPercent / totalConfiguredProb) * batchSize),
        }));

        const currentQuotaSum = quotas.reduce((s, q) => s + q.quota, 0);
        const diff = batchSize - currentQuotaSum;
        if (diff !== 0 && quotas.length > 0) {
          const maxItem = quotas.reduce((prev, curr) => 
            curr.reward.probabilityPercent > prev.reward.probabilityPercent ? curr : prev, quotas[0]
          );
          maxItem.quota = Math.max(0, maxItem.quota + diff);
        }
      }

      // 2. Determine remaining slots for each reward in the active cycle
      const eligible = quotas.map(q => {
        const normId = normalizeRewardId(q.reward.id);
        const issuedInCycle = cycleIssued[normId] || cycleIssued[q.reward.id] || 0;
        const remainingQuota = Math.max(0, q.quota - issuedInCycle);
        const stockLeft = q.reward.totalInventory - q.reward.issuedCount;
        return {
          reward: q.reward,
          slotsLeft: Math.min(remainingQuota, stockLeft),
        };
      }).filter(item => item.slotsLeft > 0);

      const totalSlots = eligible.reduce((s, item) => s + item.slotsLeft, 0);

      if (totalSlots > 0) {
        const rand = secureRandomFloat() * totalSlots;
        let cumulative = 0;
        for (const item of eligible) {
          cumulative += item.slotsLeft;
          if (rand <= cumulative) {
            return { reward: item.reward, modeUsed: 'batch_quota' };
          }
        }
        return { reward: eligible[0].reward, modeUsed: 'batch_quota' };
      }
    }
  }

  if (mode === 'weighted_random' || mode === 'batch_quota') {
    // Fallback or explicit weighted random
    const totalProb = inStockRewards.reduce((sum, r) => sum + r.probabilityPercent, 0);

    if (totalProb > 0) {
      const rand = secureRandomFloat() * totalProb;
      let cumulative = 0;

      for (const reward of inStockRewards) {
        cumulative += reward.probabilityPercent;
        if (rand <= cumulative) {
          return { reward, modeUsed: 'weighted_random' };
        }
      }
    }

    // Uniform random among in-stock rewards if total probability is 0
    const randomIndex = crypto.randomInt(0, inStockRewards.length);
    return { reward: inStockRewards[randomIndex], modeUsed: 'weighted_random' };
  }

  if (mode === 'fixed_inventory') {
    const sorted = [...inStockRewards].sort(
      (a, b) => (b.totalInventory - b.issuedCount) - (a.totalInventory - a.issuedCount)
    );
    return { reward: sorted[0], modeUsed: 'fixed_inventory' };
  }

  // Default fallback
  const fallbackIndex = crypto.randomInt(0, inStockRewards.length);
  return { reward: inStockRewards[fallbackIndex], modeUsed: 'fallback' };
}
