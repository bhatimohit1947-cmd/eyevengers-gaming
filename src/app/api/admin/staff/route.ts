import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { normalizeMobile, isValidIndianMobile, hashPassword } from '@/lib/auth/password';

const staffSchema = z.object({
  fullName: z.string().min(2),
  mobile: z.string().min(10),
  password: z.string().min(6),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const staff = db.getAllUsers('staff');
  return NextResponse.json({ staff });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = staffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid staff details' }, { status: 400 });
    }

    const { fullName, mobile, password } = parsed.data;
    const normalizedMobile = normalizeMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json({ error: 'Valid 10-digit Indian mobile number required' }, { status: 400 });
    }

    const existing = db.getUserByMobile(normalizedMobile);
    if (existing) {
      return NextResponse.json({ error: 'An account already exists for this mobile number' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newStaff = db.createUser({
      fullName: fullName.trim(),
      mobile: normalizedMobile,
      passwordHash,
      role: 'staff',
    });

    db.createAuditLog({
      adminId: session.id,
      adminName: session.fullName,
      action: 'STAFF_CREATED',
      targetType: 'STAFF',
      targetId: newStaff.id,
      details: `Created showroom staff profile: ${newStaff.fullName} (${newStaff.mobile})`,
    });

    return NextResponse.json({
      success: true,
      staff: {
        id: newStaff.id,
        fullName: newStaff.fullName,
        mobile: newStaff.mobile,
        role: newStaff.role,
        status: newStaff.status,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
