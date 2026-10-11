import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SpinWheelGame } from '@/components/games/SpinWheelGame';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getCloudUserPlaysCount } from '@/lib/db/supabaseSync';

export const dynamic = 'force-dynamic';

export default async function SpinWheelPage() {
  let spinRewards: any[] = [];
  let spinRemaining = 1;

  try {
    const campaign = db.getActiveCampaign();
    const session = await getSession();

    if (campaign) {
      const rawRewards = db.getRewardsByCampaign(campaign.id, 'spin_wheel');
      spinRewards = rawRewards.map(r => ({
        id: r.id,
        name: r.name,
        rewardType: r.rewardType,
        color: r.color,
        valueDisplay: r.monetaryValuePaise > 0 
          ? `₹${r.monetaryValuePaise / 100}` 
          : (r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : 'FREE GIFT'),
      }));

      if (session) {
        const [localSpin, cloudSpin] = await Promise.all([
          db.getUserPlaysCount(session.id, campaign.id, 'spin_wheel', session.mobile),
          getCloudUserPlaysCount(session.id, 'spin_wheel', session.mobile),
        ]);
        const spinCount = Math.max(localSpin, cloudSpin);
        spinRemaining = Math.max(0, campaign.spinLimitPerUser - spinCount);
      } else {
        spinRemaining = campaign.spinLimitPerUser;
      }
    }
  } catch (err) {
    console.warn('Spin page server prefetch error:', err);
  }

  return (
    <div className="min-h-screen bg-festive-radiant flex flex-col text-[#FFFDF7]">
      <Navbar />
      <main className="flex-1 py-6">
        <SpinWheelGame 
          initialRewards={spinRewards}
          initialRemainingPlays={spinRemaining}
        />
      </main>
      <Footer />
    </div>
  );
}
