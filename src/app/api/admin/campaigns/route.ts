import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const campaignSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  description: z.string(),
  theme: z.enum(['navratri', 'diwali', 'holi']),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  spinWheelEnabled: z.boolean(),
  mysteryBoxesEnabled: z.boolean(),
  spinLimitPerUser: z.number().min(1),
  boxLimitPerUser: z.number().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const campaigns = db.getAllCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid campaign details' }, { status: 400 });
    }

    const campaign = db.createCampaign(parsed.data);

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'CAMPAIGN_CREATED',
      targetType: 'CAMPAIGN',
      targetId: campaign.id,
      details: `Created campaign: ${campaign.name} (${campaign.theme})`,
    });

    return NextResponse.json({ success: true, campaign });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
