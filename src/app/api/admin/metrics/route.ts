import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { syncCloudProfilesToLocalDb, getSupabase, getCloudRecentRedemptions } from '@/lib/db/supabaseSync';
import { RedemptionRecord } from '@/lib/types';

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
    const localRedemptions = db.getRecentRedemptions(8);
    const activeCampaign = db.getActiveCampaign();

    // Query Supabase cloud redemptions & counts
    let cloudRedemptions: RedemptionRecord[] = [];
    try {
      cloudRedemptions = await getCloudRecentRedemptions(8);
    } catch {}

    // Merge redemptions (deduplicate by voucherCode, voucherId, or id)
    const redemptionsMap = new Map<string, RedemptionRecord>();
    for (const r of cloudRedemptions) {
      const key = r.voucherCode || r.voucherId || r.id;
      redemptionsMap.set(key, r);
    }
    for (const r of localRedemptions) {
      const key = r.voucherCode || r.voucherId || r.id;
      if (!redemptionsMap.has(key)) {
        redemptionsMap.set(key, r);
      }
    }

    const recentRedemptions = Array.from(redemptionsMap.values())
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
      .slice(0, 8);

    // Query Supabase cloud counts to guarantee metrics are accurate across serverless containers
    try {
      const client = getSupabase();
      if (client) {
        const [profRes, vchRes, playsRes, rdmCountRes] = await Promise.all([
          client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          client.from('vouchers').select('*', { count: 'exact', head: true }),
          client.from('game_plays').select('*', { count: 'exact', head: true }),
          client.from('vouchers').select('*', { count: 'exact', head: true }).eq('status', 'redeemed'),
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
        if (rdmCountRes.count !== null && rdmCountRes.count !== undefined) {
          metrics.vouchersRedeemed = Math.max(metrics.vouchersRedeemed, rdmCountRes.count);
          metrics.redemptionRate = metrics.vouchersIssued > 0
            ? Math.round((metrics.vouchersRedeemed / metrics.vouchersIssued) * 100)
            : 0;
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

