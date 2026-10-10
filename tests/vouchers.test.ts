import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/lib/db/index';

test('Voucher Issuance & Showroom Redemption Workflow', () => {
  // 1. Create unique test customer and get active campaign
  const customerMobile = `+9198888${Math.floor(10000 + Math.random() * 90000)}`;
  const customer = db.createUser({
    mobile: customerMobile,
    fullName: 'Test Player',
    passwordHash: 'dummyhash',
    role: 'customer',
  });

  const campaign = db.getActiveCampaign();
  assert.ok(campaign, 'Active campaign should exist in seeded database');

  const rewards = db.getRewardsByCampaign(campaign.id);
  assert.ok(rewards.length > 0, 'Campaign rewards should exist');
  const targetReward = rewards[0];

  // 2. Play game & issue voucher atomically
  const playResult = db.recordPlayAndIssueVoucher({
    userId: customer.id,
    campaignId: campaign.id,
    gameType: 'spin_wheel',
    rewardId: targetReward.id,
    expiryDays: 14,
  });

  assert.equal(playResult.success, true);
  assert.ok(playResult.voucher);
  assert.equal(playResult.voucher.status, 'issued');
  assert.ok(playResult.voucher.voucherCode.startsWith('EYE-'));

  const voucherId = playResult.voucher.id;

  // 3. Prevent exceeding play limit (spinLimitPerUser = 1)
  const duplicatePlay = db.recordPlayAndIssueVoucher({
    userId: customer.id,
    campaignId: campaign.id,
    gameType: 'spin_wheel',
    rewardId: targetReward.id,
  });
  assert.equal(duplicatePlay.success, false);
  assert.ok(duplicatePlay.error?.includes('limit'));

  // 4. Showroom Staff Redemption
  const staff = db.getUserByMobile('+919876500002');
  assert.ok(staff, 'Seed staff account should exist');

  const redeemResult = db.redeemVoucher({
    voucherId,
    staffId: staff.id,
    billReference: 'BILL-TEST-1001',
    purchaseAmountPaise: 99900,
    showroomLocation: 'Sardarpura Showroom, Jodhpur',
  });

  assert.equal(redeemResult.success, true);
  assert.equal(redeemResult.voucher?.status, 'redeemed');
  assert.equal(redeemResult.voucher?.billReference, 'BILL-TEST-1001');

  // 5. Concurrency / Double Redemption Protection
  const doubleRedeem = db.redeemVoucher({
    voucherId,
    staffId: staff.id,
    billReference: 'BILL-TEST-DUPLICATE',
  });

  assert.equal(doubleRedeem.success, false);
  assert.ok(doubleRedeem.error?.includes('already been redeemed'));
});
