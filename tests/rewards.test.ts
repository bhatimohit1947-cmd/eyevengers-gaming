import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateReward } from '../src/lib/rewards/engine';
import { db } from '../src/lib/db/index';
import { Reward } from '../src/lib/types';

test('Reward Allocation Engine: respects weighted probabilities and inventory availability', () => {
  const dummyRewards: Reward[] = [
    {
      id: 'rew-test-1',
      campaignId: 'cmp-test',
      name: 'Reward 90%',
      description: 'High chance reward',
      rewardType: 'fixed_discount',
      monetaryValuePaise: 5000,
      discountPercentage: 0,
      minPurchasePaise: 0,
      maxDiscountPaise: 0,
      totalInventory: 100,
      reservedInventory: 0,
      issuedCount: 0,
      redeemedCount: 0,
      probabilityPercent: 90.0,
      isActive: true,
      applicableGame: 'both',
      terms: 'Terms',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'rew-test-2',
      campaignId: 'cmp-test',
      name: 'Reward 10%',
      description: 'Low chance reward',
      rewardType: 'fixed_discount',
      monetaryValuePaise: 10000,
      discountPercentage: 0,
      minPurchasePaise: 0,
      maxDiscountPaise: 0,
      totalInventory: 100,
      reservedInventory: 0,
      issuedCount: 0,
      redeemedCount: 0,
      probabilityPercent: 10.0,
      isActive: true,
      applicableGame: 'both',
      terms: 'Terms',
      createdAt: '',
      updatedAt: '',
    },
  ];

  // Run 100 allocations
  let highWins = 0;
  for (let i = 0; i < 100; i++) {
    const res = allocateReward(dummyRewards, 'weighted_random');
    assert.ok(res);
    if (res.reward.id === 'rew-test-1') highWins++;
  }

  // 90% reward should win significantly more than 10% reward
  assert.ok(highWins > 65, `Expected highWins > 65, got ${highWins}`);
});

test('Reward Allocation Engine: ignores exhausted inventory items', () => {
  const dummyRewards: Reward[] = [
    {
      id: 'exhausted-1',
      campaignId: 'cmp-test',
      name: 'Sold Out Reward',
      description: '',
      rewardType: 'fixed_discount',
      monetaryValuePaise: 5000,
      discountPercentage: 0,
      minPurchasePaise: 0,
      maxDiscountPaise: 0,
      totalInventory: 10,
      reservedInventory: 0,
      issuedCount: 10, // Stock fully exhausted!
      redeemedCount: 0,
      probabilityPercent: 99.0,
      isActive: true,
      applicableGame: 'both',
      terms: 'Terms',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'in-stock-1',
      campaignId: 'cmp-test',
      name: 'Available Reward',
      description: '',
      rewardType: 'fixed_discount',
      monetaryValuePaise: 5000,
      discountPercentage: 0,
      minPurchasePaise: 0,
      maxDiscountPaise: 0,
      totalInventory: 50,
      reservedInventory: 0,
      issuedCount: 5,
      redeemedCount: 0,
      probabilityPercent: 1.0,
      isActive: true,
      applicableGame: 'both',
      terms: 'Terms',
      createdAt: '',
      updatedAt: '',
    },
  ];

  // Must only pick the in-stock reward despite the higher probability of the exhausted one
  for (let i = 0; i < 10; i++) {
    const res = allocateReward(dummyRewards, 'weighted_random');
    assert.ok(res);
    assert.equal(res.reward.id, 'in-stock-1');
  }
});
