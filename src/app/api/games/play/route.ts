import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { allocateReward } from '@/lib/rewards/engine';
import { 
  saveVoucherToCloud, 
  saveGamePlayToCloud, 
  getCloudUserPlaysCount, 
  syncCloudRewardsToLocalDb, 
  getCloudRewards 
} from '@/lib/db/supabaseSync';

import { checkRateLimit, acquirePlayLock, releasePlayLock } from '@/lib/security/rateLimit';

const playSchema = z.object({
  gameType: z.enum(['spin_wheel', 'mystery_box']),
  boxIndex: z.number().optional(), // box chosen in mystery box
});

export async function POST(req: Request) {
  let session = null;
  try {
    session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to play and receive your festive reward.' },
        { status: 401 }
      );
    }

    // Rate Limit: Max 5 plays per minute per user account
    const rateLimit = checkRateLimit(`play:${session.id}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before playing again.' },
        { status: 429 }
      );
    }

    // Concurrency Lock: Prevent parallel/race condition voucher duplication
    if (!acquirePlayLock(session.id)) {
      return NextResponse.json(
        { error: 'A game play is already in progress for your account. Please wait.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = playSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid game request' }, { status: 400 });
    }

    const { gameType } = parsed.data;

    // 1. Check active campaign
    const campaign = db.getActiveCampaign();
    if (!campaign || !campaign.isActive) {
      return NextResponse.json({ error: 'Festive campaign is currently not active.' }, { status: 400 });
    }

    // Check game enabled
    if (gameType === 'spin_wheel' && !campaign.spinWheelEnabled) {
      return NextResponse.json({ error: 'Lucky Spin Wheel is currently closed.' }, { status: 400 });
    }
    if (gameType === 'mystery_box' && !campaign.mysteryBoxesEnabled) {
      return NextResponse.json({ error: 'Mystery Boxes game is currently closed.' }, { status: 400 });
    }

    // 2. Check play limits (both local SQLite and Supabase cloud to prevent multi-device bypass)
    const allowedLimit = gameType === 'spin_wheel' ? campaign.spinLimitPerUser : campaign.boxLimitPerUser;
    const localPlays = db.getUserPlaysCount(session.id, campaign.id, gameType, session.mobile);
    const cloudPlays = await getCloudUserPlaysCount(session.id, gameType, session.mobile);
    const currentPlays = Math.max(localPlays, cloudPlays);

    if (currentPlays >= allowedLimit) {
      return NextResponse.json(
        { error: `You have reached the maximum allowed plays (${allowedLimit}) for this game in this festive campaign.` },
        { status: 403 }
      );
    }

    // 3. Get eligible rewards (syncing live cloud rewards from Supabase)
    try {
      await syncCloudRewardsToLocalDb(db.getRawDb());
    } catch {}

    let candidateRewards = db.getRewardsByCampaign(campaign.id, gameType);
    try {
      const allCloud = await getCloudRewards(campaign.id);
      if (allCloud && allCloud.length > 0) {
        const filtered = allCloud.filter(r => r.isActive && (r.applicableGame === gameType || r.applicableGame === 'both'));
        if (filtered.length > 0) {
          candidateRewards = filtered;
        }
      }
    } catch {}

    if (candidateRewards.length === 0) {
      return NextResponse.json(
        { error: 'No active rewards are configured for this game.' },
        { status: 500 }
      );
    }

    // 4. Server-Side Reward Allocation using updated winning odds
    const allocation = allocateReward(candidateRewards, 'weighted_random');
    if (!allocation) {
      return NextResponse.json(
        { error: 'Reward inventory is currently exhausted. Please check back soon!' },
        { status: 500 }
      );
    }

    // 5. Atomic Transaction: record play, decrement stock, issue voucher
    const result = db.recordPlayAndIssueVoucher({
      userId: session.id,
      userMobile: session.mobile,
      userName: session.fullName,
      campaignId: campaign.id,
      gameType,
      rewardId: allocation.reward.id,
      expiryDays: 14,
    });

    if (!result.success || !result.voucher || !result.gamePlay) {
      return NextResponse.json({ error: result.error || 'Reward allocation failed' }, { status: 500 });
    }

    // Persist BOTH voucher and game play to Supabase cloud
    try {
      await Promise.all([
        saveVoucherToCloud({
          id: result.voucher.id,
          userId: result.voucher.userId,
          userMobile: session.mobile,
          campaignId: result.voucher.campaignId,
          rewardId: result.voucher.rewardId,
          voucherCode: result.voucher.voucherCode,
          qrToken: result.voucher.qrToken,
          status: result.voucher.status,
          expiryDate: result.voucher.expiryDate,
          createdAt: result.voucher.createdAt,
        }),
        saveGamePlayToCloud({
          id: result.gamePlay.id,
          userId: session.id,
          userMobile: session.mobile,
          campaignId: campaign.id,
          gameType,
          rewardId: allocation.reward.id,
          metadata: parsed.data.boxIndex !== undefined ? { boxIndex: parsed.data.boxIndex } : {},
          playedAt: new Date().toISOString(),
        }),
      ]);
    } catch (err) {
      console.warn('Cloud sync on play warning:', err);
    }

    // Calculate segment index for Spin Wheel visual alignment
    const segmentIndex = candidateRewards.findIndex(r => r.id === allocation.reward.id);
    const newPlaysCount = currentPlays + 1;
    const remainingPlays = Math.max(0, allowedLimit - newPlaysCount);

    return NextResponse.json({
      success: true,
      reward: {
        id: allocation.reward.id,
        name: allocation.reward.name,
        description: allocation.reward.description,
        type: allocation.reward.rewardType,
        valueDisplay: result.voucher.rewardValueDisplay,
        color: allocation.reward.color,
      },
      voucher: {
        id: result.voucher.id,
        voucherCode: result.voucher.voucherCode,
        qrToken: result.voucher.qrToken,
        expiryDate: result.voucher.expiryDate,
      },
      segmentIndex: segmentIndex >= 0 ? segmentIndex : 0,
      totalSegments: candidateRewards.length,
      remainingPlays,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (session) {
      releasePlayLock(session.id);
    }
  }
}
