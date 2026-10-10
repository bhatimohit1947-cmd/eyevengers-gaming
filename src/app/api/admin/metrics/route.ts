import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const metrics = db.getDashboardMetrics();
    const recentRedemptions = db.getRecentRedemptions(8);
    const activeCampaign = db.getActiveCampaign();

    return NextResponse.json({
      metrics,
      recentRedemptions,
      activeCampaign,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
