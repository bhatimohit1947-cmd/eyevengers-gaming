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

    // Query Supabase cloud count to guarantee customer count is accurate across serverless containers
    try {
      const client = getSupabase();
      if (client) {
        const { count, error } = await client
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
        if (count !== null && count !== undefined && !error) {
          metrics.totalCustomers = Math.max(metrics.totalCustomers, count);
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
