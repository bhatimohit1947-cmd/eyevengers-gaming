import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeMobile, isValidIndianMobile, hashPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { saveProfileToCloud, getProfileFromCloudByMobile } from '@/lib/db/supabaseSync';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Valid 10-digit mobile number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept terms and conditions'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid registration details' },
        { status: 400 }
      );
    }

    const { fullName, mobile, password } = parsed.data;
    const normalizedMobile = normalizeMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    let existingUser = db.getUserByMobile(normalizedMobile);
    if (!existingUser) {
      existingUser = await getProfileFromCloudByMobile(normalizedMobile);
      if (existingUser) {
        db.saveUserLocally(existingUser);
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account is already registered with this mobile number. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = db.createUser({
      mobile: normalizedMobile,
      fullName: fullName.trim(),
      passwordHash,
      role: 'customer',
    });

    // Permanently persist to Supabase cloud
    await saveProfileToCloud({
      id: newUser.id,
      mobile: newUser.mobile,
      fullName: newUser.fullName,
      passwordHash,
      role: newUser.role,
      status: newUser.status,
    });

    await setSessionCookie({
      id: newUser.id,
      mobile: newUser.mobile,
      fullName: newUser.fullName,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        mobile: newUser.mobile,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
