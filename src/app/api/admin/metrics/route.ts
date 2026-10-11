import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { syncCloudProfilesToLocalDb, getSupabase } from '@/lib/db/supabaseSync';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    try {
      await syncCloudProfilesToLocalDb(db.getRawDb());
    } catch {}

    const metrics = db.getDashboardMetrics();
    const recentRedemptions = db.getRecentRedemptions(8);
    const activeCampaign = db.getActiveCampaign();

    // Query Supabase cloud counts to guarantee metrics are accurate across serverless containers
    try {
      const client = getSupabase();
      if (client) {
        const [profRes, vchRes, playsRes] = await Promise.all([
          client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          client.from('vouchers').select('*', { count: 'exact', head: true }),
          client.from('game_plays').select('*', { count: 'exact', head: true }),
        ]);

        if (profRes.count !== null && profRes.count !== undefined) {
          metrics.totalCustomers = Math.max(metrics.totalCustomers, profRes.count);
        }
        if (vchRes.count !== null && vchRes.count !== undefined) {
          metrics.vouchersIssued = Math.max(metrics.vouchersIssued, vchRes.count);
        }
        if (playsRes.count !== null && playsRes.count !== undefined) {
          metrics.totalPlays = Math.max(metrics.totalPlays, playsRes.count);
        }
      }
    } catch {}

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
