import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getCloudUserVouchers } from '@/lib/db/supabaseSync';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const localVouchers = db.getUserVouchers(session.id, session.mobile);
    const cloudVouchers = await getCloudUserVouchers(session.id, session.mobile);

    // Merge by voucherCode or id so vouchers are NEVER lost across serverless containers
    const map = new Map<string, any>();
    for (const v of localVouchers) {
      const key = v.voucherCode || v.id;
      map.set(key, v);
    }
    for (const v of cloudVouchers) {
      const key = v.voucherCode || v.id;
      if (!map.has(key)) {
        map.set(key, v);
      }
    }

    const vouchers = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || b.issueDate).getTime() - new Date(a.createdAt || a.issueDate).getTime()
    );

    return NextResponse.json({ vouchers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
