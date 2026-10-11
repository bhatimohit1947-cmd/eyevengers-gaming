import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getCloudVoucherByCodeOrToken } from '@/lib/db/supabaseSync';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const code = searchParams.get('code');

    if (!token && !code) {
      return NextResponse.json({ error: 'Please provide voucher code or QR token' }, { status: 400 });
    }

    let voucher = token ? db.getVoucherByQrToken(token) : db.getVoucherByCode(code!);
    if (!voucher) {
      voucher = await getCloudVoucherByCodeOrToken(token || code!);
    }
    if (!voucher) {
      return NextResponse.json({ error: 'No voucher found matching the code or QR token.' }, { status: 404 });
    }

    const isExpired = new Date(voucher.expiryDate) < new Date();

    return NextResponse.json({
      voucher,
      isExpired,
      canRedeem: voucher.status === 'issued' && !isExpired,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
