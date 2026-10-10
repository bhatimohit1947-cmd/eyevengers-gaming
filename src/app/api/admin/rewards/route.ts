import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const rewardSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(2),
  description: z.string(),
  rewardType: z.enum(['fixed_discount', 'percentage_discount', 'free_product', 'free_service', 'custom']),
  monetaryValuePaise: z.number().min(0),
  discountPercentage: z.number().min(0).max(100),
  minPurchasePaise: z.number().min(0),
  maxDiscountPaise: z.number().min(0),
  totalInventory: z.number().min(0),
  probabilityPercent: z.number().min(0).max(100),
  isActive: z.boolean(),
  applicableGame: z.enum(['spin_wheel', 'mystery_box', 'both']),
  terms: z.string(),
  color: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId') || undefined;

  const rewards = db.getAllRewards(campaignId);
  return NextResponse.json({ rewards });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = rewardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid reward data' }, { status: 400 });
    }

    const reward = db.createReward(parsed.data);

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'REWARD_CREATED',
      targetType: 'REWARD',
      targetId: reward.id,
      details: `Created reward: ${reward.name} (Stock: ${reward.totalInventory}, Prob: ${reward.probabilityPercent}%)`,
    });

    return NextResponse.json({ success: true, reward });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
