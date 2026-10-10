import crypto from 'crypto';
import { Reward } from '../types';

export interface AllocationResult {
  reward: Reward;
  modeUsed: 'weighted_random' | 'fixed_inventory' | 'fallback';
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
 * Server-side Reward Allocation Engine
 * The browser NEVER picks or alters the prize.
 */
export function allocateReward(
  availableRewards: Reward[],
  mode: 'weighted_random' | 'fixed_inventory' | 'fixed_reward' = 'weighted_random'
): AllocationResult | null {
  // Filter active rewards with remaining inventory
  const inStockRewards = availableRewards.filter(
    (r) => r.isActive && r.totalInventory - r.issuedCount > 0
  );

  if (inStockRewards.length === 0) {
    return null;
  }

  if (mode === 'weighted_random') {
    // Check if rewards have configured probabilities
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
    // Pick the reward with highest inventory proportion or random in-stock
    const sorted = [...inStockRewards].sort(
      (a, b) => (b.totalInventory - b.issuedCount) - (a.totalInventory - a.issuedCount)
    );
    return { reward: sorted[0], modeUsed: 'fixed_inventory' };
  }

  // Default fallback
  const fallbackIndex = crypto.randomInt(0, inStockRewards.length);
  return { reward: inStockRewards[fallbackIndex], modeUsed: 'fallback' };
}
