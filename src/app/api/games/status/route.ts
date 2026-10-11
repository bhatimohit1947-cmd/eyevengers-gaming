import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getCloudUserPlaysCount } from '@/lib/db/supabaseSync';

export async function GET() {
  try {
    const campaign = db.getActiveCampaign();
    if (!campaign) {
      return NextResponse.json({
        active: false,
        message: 'No active festive campaign at the moment.',
      });
    }

    const session = await getSession();
    let spinRemaining = campaign.spinLimitPerUser;
    let boxRemaining = campaign.boxLimitPerUser;
    let userPlays = { spinWheel: 0, mysteryBox: 0 };

    if (session) {
      const [localSpin, localBox, cloudSpin, cloudBox] = await Promise.all([
        db.getUserPlaysCount(session.id, campaign.id, 'spin_wheel', session.mobile),
        db.getUserPlaysCount(session.id, campaign.id, 'mystery_box', session.mobile),
        getCloudUserPlaysCount(session.id, 'spin_wheel'),
        getCloudUserPlaysCount(session.id, 'mystery_box'),
      ]);

      const spinCount = Math.max(localSpin, cloudSpin);
      const boxCount = Math.max(localBox, cloudBox);

      userPlays = { spinWheel: spinCount, mysteryBox: boxCount };
      spinRemaining = Math.max(0, campaign.spinLimitPerUser - spinCount);
      boxRemaining = Math.max(0, campaign.boxLimitPerUser - boxCount);
    }

    const spinRewards = db.getRewardsByCampaign(campaign.id, 'spin_wheel');
    const boxRewards = db.getRewardsByCampaign(campaign.id, 'mystery_box');

    return NextResponse.json({
      active: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        theme: campaign.theme,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        spinWheelEnabled: campaign.spinWheelEnabled,
        mysteryBoxesEnabled: campaign.mysteryBoxesEnabled,
        spinLimitPerUser: campaign.spinLimitPerUser,
        boxLimitPerUser: campaign.boxLimitPerUser,
      },
      user: session ? { id: session.id, name: session.fullName, mobile: session.mobile } : null,
      plays: {
        spinRemaining,
        boxRemaining,
        totalSpinPlayed: userPlays.spinWheel,
        totalBoxPlayed: userPlays.mysteryBox,
      },
      rewards: {
        spinWheel: spinRewards.map(r => ({
          id: r.id,
          name: r.name,
          rewardType: r.rewardType,
          color: r.color,
          valueDisplay: r.monetaryValuePaise > 0 
            ? `₹${r.monetaryValuePaise / 100}` 
            : (r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : 'FREE GIFT'),
        })),
        mysteryBox: boxRewards.map(r => ({
          id: r.id,
          name: r.name,
          rewardType: r.rewardType,
          color: r.color,
          valueDisplay: r.monetaryValuePaise > 0 
            ? `₹${r.monetaryValuePaise / 100}` 
            : (r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : 'SURPRISE'),
        })),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
