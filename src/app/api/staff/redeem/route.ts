import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const redeemSchema = z.object({
  voucherId: z.string().min(1, 'Voucher ID is required'),
  billReference: z.string().optional(),
  purchaseAmount: z.number().optional(), // In Rupees, converted to paise
  showroomLocation: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized: Staff access required' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { voucherId, billReference, purchaseAmount, showroomLocation } = parsed.data;

    const purchaseAmountPaise = purchaseAmount ? Math.round(purchaseAmount * 100) : undefined;

    const result = db.redeemVoucher({
      voucherId,
      staffId: session.id,
      billReference,
      purchaseAmountPaise,
      showroomLocation: showroomLocation || 'Bhadu Market Showroom, Jodhpur',
    });

    if (!result.success || !result.voucher) {
      return NextResponse.json({ error: result.error || 'Failed to redeem voucher' }, { status: 400 });
    }

    // Log in admin audit logs as well
    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'VOUCHER_REDEEMED',
      targetType: 'VOUCHER',
      targetId: result.voucher.voucherCode,
      details: `Redeemed by ${session.fullName}. Bill: ${billReference || 'N/A'}, Amount: ₹${purchaseAmount || 0}`,
    });

    return NextResponse.json({
      success: true,
      voucher: result.voucher,
      message: `Voucher ${result.voucher.voucherCode} successfully redeemed!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
