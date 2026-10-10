import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string(),
  imageUrl: z.string().min(1),
  ctaText: z.string().min(1),
  ctaLink: z.string().min(1),
  displayOrder: z.number().min(1),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  theme: z.enum(['navratri', 'diwali', 'holi']).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const banners = db.getAllBanners();
  return NextResponse.json({ banners });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid banner data' }, { status: 400 });
    }

    const banner = db.createBanner(parsed.data);

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'BANNER_CREATED',
      targetType: 'BANNER',
      targetId: banner.id,
      details: `Created banner: ${banner.title}`,
    });

    return NextResponse.json({ success: true, banner });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
