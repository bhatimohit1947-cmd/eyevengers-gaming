import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function POST(
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
    const reason = body.reason || 'Admin revoked';

    db.revokeVoucher(id, reason);

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'VOUCHER_REVOKED',
      targetType: 'VOUCHER',
      targetId: id,
      details: `Revoked with reason: ${reason}`,
    });

    return NextResponse.json({ success: true, message: 'Voucher revoked' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
