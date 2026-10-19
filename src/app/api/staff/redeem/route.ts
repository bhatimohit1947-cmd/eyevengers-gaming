import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { redeemCloudVoucher, getCloudVoucherByCodeOrToken } from '@/lib/db/supabaseSync';

const redeemSchema = z.object({
  voucherId: z.string().min(1, 'Voucher ID is required'),
  voucherCode: z.string().optional(),
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

    const { voucherId, voucherCode, billReference, purchaseAmount, showroomLocation } = parsed.data;
    const purchaseAmountPaise = purchaseAmount ? Math.round(purchaseAmount * 100) : undefined;
    const location = showroomLocation || 'Bhadu Market Showroom, Jodhpur';

    // 1. Ensure staff profile exists locally in SQLite
    try {
      db.saveUserLocally({
        id: session.id,
        mobile: session.mobile || '+919876500002',
        fullName: session.fullName || 'Showroom Staff',
        passwordHash: '',
        role: session.role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    // 2. Look up voucher locally or from Supabase cloud
    let localVch = db.getVoucherById(voucherId) || db.getVoucherByCode(voucherId);
    if (!localVch && voucherCode) {
      localVch = db.getVoucherByCode(voucherCode) || db.getVoucherById(voucherCode);
    }

    let cloudVch: any = null;
    try {
      cloudVch = await getCloudVoucherByCodeOrToken(voucherCode || voucherId);
    } catch {}

    // If local voucher is missing but found in cloud, save to local SQLite
    if (!localVch && cloudVch) {
      try {
        db.saveVoucherLocally(cloudVch);
        localVch = db.getVoucherById(cloudVch.id) || db.getVoucherByCode(cloudVch.voucherCode);
      } catch {}
    }

    // Check if voucher doesn't exist anywhere
    if (!localVch && !cloudVch) {
      return NextResponse.json({ error: 'Voucher does not exist.' }, { status: 400 });
    }

    // Check already redeemed
    if ((localVch && localVch.status === 'redeemed') || (cloudVch && cloudVch.status === 'redeemed')) {
      return NextResponse.json({ error: 'Voucher has already been redeemed earlier.' }, { status: 400 });
    }

    // Check revoked/cancelled
    if ((localVch && localVch.status === 'cancelled') || (cloudVch && cloudVch.status === 'cancelled')) {
      return NextResponse.json({ error: 'Voucher has been revoked or cancelled.' }, { status: 400 });
    }

    // Check expired
    const expiry = cloudVch?.expiryDate || localVch?.expiryDate;
    if (expiry && new Date(expiry) < new Date()) {
      return NextResponse.json({ error: 'Voucher has expired.' }, { status: 400 });
    }

    // Target voucher ID and Code
    const targetVoucherId = localVch?.id || cloudVch?.id || voucherId;
    const targetVoucherCode = localVch?.voucherCode || cloudVch?.voucherCode || voucherCode || voucherId;

    // 3. Redeem in Cloud (Supabase)
    let cloudResult: any = null;
    try {
      cloudResult = await redeemCloudVoucher({
        voucherId: targetVoucherId,
        voucherCode: targetVoucherCode,
        staffId: session.id,
        staff: {
          id: session.id,
          mobile: session.mobile,
          fullName: session.fullName,
          role: session.role,
        },
        billReference,
        purchaseAmountPaise,
        showroomLocation: location,
      });
    } catch (cloudErr) {
      console.warn('Cloud voucher redemption error:', cloudErr);
    }

    // 4. Redeem in local SQLite
    let localResult = db.redeemVoucher({
      voucherId: targetVoucherId,
      staffId: session.id,
      billReference,
      purchaseAmountPaise,
      showroomLocation: location,
    });

    // If local was missing but cloud succeeded, sync cloud voucher into local and re-try
    if (!localResult.success && cloudResult?.success && cloudResult.voucher) {
      try {
        db.saveVoucherLocally(cloudResult.voucher);
        localResult = db.redeemVoucher({
          voucherId: targetVoucherId,
          staffId: session.id,
          billReference,
          purchaseAmountPaise,
          showroomLocation: location,
        });
      } catch {}
    }

    const finalVoucher = localResult.voucher || cloudResult?.voucher || localVch || cloudVch;
    const finalCode = finalVoucher?.voucherCode || targetVoucherCode;

    // If both failed
    if (!localResult.success && (!cloudResult || !cloudResult.success)) {
      const errMsg = cloudResult?.error || localResult.error || 'Failed to redeem voucher';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    // 5. Create audit log
    try {
      db.createAuditLog({
        adminId: session.id,
        adminName: session.fullName || 'Showroom Staff',
        action: 'VOUCHER_REDEEMED',
        targetType: 'VOUCHER',
        targetId: finalCode,
        details: `Redeemed by ${session.fullName}. Bill: ${billReference || 'N/A'}, Amount: ₹${purchaseAmount || 0}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      voucher: {
        ...(finalVoucher || {}),
        status: 'redeemed',
        redeemedAt: new Date().toISOString(),
        billReference,
        purchaseAmountPaise,
      },
      message: `Voucher ${finalCode} successfully redeemed!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
