import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeMobile, verifyPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { getProfileFromCloudByMobile } from '@/lib/db/supabaseSync';

import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';

const loginSchema = z.object({
  mobile: z.string().min(10, 'Mobile number required'),
  password: z.string().min(1, 'Password required'),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = checkRateLimit(`login:ip:${ip}`, 15, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts from this network. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Please provide mobile number and password' }, { status: 400 });
    }

    const { mobile, password } = parsed.data;
    const normalizedMobile = normalizeMobile(mobile);

    const mobileLimit = checkRateLimit(`login:mobile:${normalizedMobile}`, 8, 60 * 1000);
    if (!mobileLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts for this mobile number. Please wait a minute.' },
        { status: 429 }
      );
    }

    let user = db.getUserByMobile(normalizedMobile);
    let cloudUser = await getProfileFromCloudByMobile(normalizedMobile);

    if (cloudUser && cloudUser.passwordHash) {
      try {
        db.saveUserLocally(cloudUser as any);
      } catch {}
      // Cloud user UUID is the single source of truth across all devices and servers
      user = cloudUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid mobile number or password.' }, { status: 401 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact showroom administration.' },
        { status: 403 }
      );
    }

    // Verify password against local hash or cloud hash
    let isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid && cloudUser && cloudUser.passwordHash) {
      isValid = await verifyPassword(password, cloudUser.passwordHash);
      if (isValid) {
        user = cloudUser;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid mobile number or password.' }, { status: 401 });
    }

    await setSessionCookie({
      id: user.id,
      mobile: user.mobile,
      fullName: user.fullName,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
