import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { updateCloudReward } from '@/lib/db/supabaseSync';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    let updated = db.updateReward(id, body);
    
    // Also try updating via mapped IDs if necessary
    const REWARD_MAP_REVERSE: Record<string, string> = {
      '33333333-3333-3333-3333-000000000001': 'rew-001',
      '33333333-3333-3333-3333-000000000002': 'rew-002',
      '33333333-3333-3333-3333-000000000003': 'rew-003',
      '33333333-3333-3333-3333-000000000004': 'rew-004',
      '33333333-3333-3333-3333-000000000005': 'rew-005',
      '33333333-3333-3333-3333-000000000006': 'rew-006',
      '33333333-3333-3333-3333-000000000007': 'rew-007',
      '33333333-3333-3333-3333-000000000008': 'rew-008',
    };
    if (!updated && REWARD_MAP_REVERSE[id]) {
      updated = db.updateReward(REWARD_MAP_REVERSE[id], body);
    }

    // Persist to Supabase cloud immediately
    try {
      await updateCloudReward(id, body);
    } catch (e) {
      console.warn('Cloud reward update error:', e);
    }

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'REWARD_UPDATED',
      targetType: 'REWARD',
      targetId: id,
      details: `Updated reward properties: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({ success: true, message: 'Reward updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
