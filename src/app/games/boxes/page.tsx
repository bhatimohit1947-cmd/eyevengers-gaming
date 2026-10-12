import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MysteryBoxesGame } from '@/components/games/MysteryBoxesGame';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getCloudUserPlaysCount } from '@/lib/db/supabaseSync';

export const dynamic = 'force-dynamic';

export default async function MysteryBoxesPage() {
  let boxRemaining = 1;
  let user: { id: string; name: string } | null = null;

  let session: any = null;

  try {
    const campaign = db.getActiveCampaign();
    session = await getSession();

    if (session) {
      user = { id: session.id, name: session.fullName };
    }

    if (campaign) {
      if (session) {
        const [localBox, cloudBox] = await Promise.all([
          db.getUserPlaysCount(session.id, campaign.id, 'mystery_box', session.mobile),
          getCloudUserPlaysCount(session.id, 'mystery_box', session.mobile),
        ]);
        const boxCount = Math.max(localBox, cloudBox);
        boxRemaining = Math.max(0, campaign.boxLimitPerUser - boxCount);
      } else {
        boxRemaining = campaign.boxLimitPerUser;
      }
    }
  } catch (err) {
    console.warn('Boxes page server prefetch error:', err);
  }

  return (
    <div className="min-h-screen bg-festive-radiant flex flex-col text-[#FFFDF7]">
      <Navbar initialUser={session} />
      <main className="flex-1 py-6">
        <MysteryBoxesGame 
          initialRemainingPlays={boxRemaining}
          initialUser={user}
        />
      </main>
      <Footer />
    </div>
  );
}
