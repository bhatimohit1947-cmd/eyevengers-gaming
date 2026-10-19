import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getAllCloudVouchers } from '@/lib/db/supabaseSync';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const localVouchers = db.getAllVouchers(status, search);
  const cloudVouchers = await getAllCloudVouchers();

  // Merge and deduplicate by voucherCode or id
  const map = new Map<string, any>();
  for (const v of cloudVouchers) {
    const key = v.voucherCode || v.id;
    map.set(key, { ...v });
  }
  for (const v of localVouchers) {
    const key = v.voucherCode || v.id;
    if (map.has(key)) {
      const existing = map.get(key);
      if (v.status === 'redeemed' || existing.status === 'redeemed') {
        existing.status = 'redeemed';
        existing.redeemedAt = existing.redeemedAt || v.redeemedAt;
        existing.billReference = existing.billReference || v.billReference;
        existing.purchaseAmountPaise = existing.purchaseAmountPaise || v.purchaseAmountPaise;
        existing.redeemedByStaffId = existing.redeemedByStaffId || v.redeemedByStaffId;
      }
      if (v.status === 'cancelled' || existing.status === 'cancelled') {
        existing.status = 'cancelled';
      }
      // Ensure customer details from profile are preserved if available
      if (!existing.customerName && v.customerName) existing.customerName = v.customerName;
      if (!existing.customerMobile && v.customerMobile) existing.customerMobile = v.customerMobile;
    } else {
      map.set(key, { ...v });
    }
  }

  let vouchers = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || b.issueDate).getTime() - new Date(a.createdAt || a.issueDate).getTime()
  );

  if (status) {
    vouchers = vouchers.filter(v => v.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    vouchers = vouchers.filter(v =>
      (v.voucherCode && v.voucherCode.toLowerCase().includes(q)) ||
      (v.customerName && v.customerName.toLowerCase().includes(q)) ||
      (v.customerMobile && v.customerMobile.includes(q))
    );
  }

  return NextResponse.json({ vouchers });
}
