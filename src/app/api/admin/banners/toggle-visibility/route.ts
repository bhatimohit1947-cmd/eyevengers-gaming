import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { toggleAllCloudBanners } from '@/lib/db/supabaseSync';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : !body.hideAll;

    // 1. Update SQLite banners
    const allBanners = db.getAllBanners();
    for (const b of allBanners) {
      db.updateBanner(b.id, { isActive });
    }

    // 2. Update Supabase Cloud banners
    await toggleAllCloudBanners(isActive);

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: isActive ? 'BANNERS_SHOWN' : 'BANNERS_HIDDEN',
      targetType: 'BANNER',
      targetId: 'all',
      details: `Admin changed homepage promotional banner visibility to: ${isActive ? 'VISIBLE' : 'HIDDEN'}`,
    });

    return NextResponse.json({
      success: true,
      isActive,
      message: isActive ? 'Promotional banners are now visible on the website homepage.' : 'Promotional banners have been hidden from the website homepage.'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
