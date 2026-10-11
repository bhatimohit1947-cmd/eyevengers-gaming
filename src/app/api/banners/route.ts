import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCloudBanners } from '@/lib/db/supabaseSync';

export async function GET() {
  try {
    const cloudBanners = await getCloudBanners(true);
    if (cloudBanners && cloudBanners.length > 0) {
      return NextResponse.json({ banners: cloudBanners });
    }

    // Check if cloud has inactive banners explicitly hidden
    const allCloud = await getCloudBanners(false);
    if (allCloud && allCloud.length > 0) {
      // Cloud banners exist but are all inactive / hidden!
      return NextResponse.json({ banners: [] });
    }

    const banners = db.getActiveBanners();
    return NextResponse.json({ banners });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
