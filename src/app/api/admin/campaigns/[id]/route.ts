import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

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
    const updated = db.updateCampaign(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'CAMPAIGN_UPDATED',
      targetType: 'CAMPAIGN',
      targetId: id,
      details: `Updated campaign fields: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({ success: true, message: 'Campaign updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
