import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeMobile, hashPassword } from '@/lib/auth/password';
import { sendOtp, verifyOtp } from '@/lib/auth/smsProvider';
import { getProfileFromCloudByMobile, updateProfilePasswordInCloud } from '@/lib/db/supabaseSync';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';

const requestOtpSchema = z.object({
  action: z.literal('request_otp'),
  mobile: z.string().min(10),
});

const resetPasswordSchema = z.object({
  action: z.literal('reset_password'),
  mobile: z.string().min(10),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'request_otp') {
      const parsed = requestOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Valid mobile number required' }, { status: 400 });
      }

      const normalizedMobile = normalizeMobile(parsed.data.mobile);
      const ip = getClientIp(req);

      // Rate limit OTP requests: Max 3 per 10 minutes per mobile/IP to prevent SMS bombing
      const otpLimit = checkRateLimit(`otp:${normalizedMobile}`, 3, 10 * 60 * 1000);
      const ipOtpLimit = checkRateLimit(`otp:ip:${ip}`, 5, 10 * 60 * 1000);
      if (!otpLimit.allowed || !ipOtpLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many OTP requests. Please wait a few minutes before requesting again.' },
          { status: 429 }
        );
      }

      let user = db.getUserByMobile(normalizedMobile);
      if (!user) {
        const cloudUser = await getProfileFromCloudByMobile(normalizedMobile);
        if (cloudUser && cloudUser.passwordHash) {
          try {
            db.saveUserLocally(cloudUser as any);
          } catch {}
          user = db.getUserByMobile(normalizedMobile);
        }
      }

      if (!user) {
        // Safe message: do not reveal user existence
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this mobile number, an OTP has been dispatched.',
        });
      }

      const smsRes = await sendOtp(normalizedMobile);
      return NextResponse.json({
        success: true,
        message: 'OTP dispatched successfully.',
        ...(process.env.NODE_ENV !== 'production' && smsRes.devOtp ? { devOtp: smsRes.devOtp } : {}),
        provider: smsRes.provider,
      });
    }

    if (body.action === 'reset_password') {
      const parsed = resetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid details' }, { status: 400 });
      }

      const { mobile, otp, newPassword } = parsed.data;
      const normalizedMobile = normalizeMobile(mobile);

      const isValidOtp = verifyOtp(normalizedMobile, otp);
      if (!isValidOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 });
      }

      let user = db.getUserByMobile(normalizedMobile);
      if (!user) {
        const cloudUser = await getProfileFromCloudByMobile(normalizedMobile);
        if (cloudUser && cloudUser.passwordHash) {
          db.saveUserLocally(cloudUser as any);
          user = db.getUserByMobile(normalizedMobile);
        }
      }

      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }

      const newHash = await hashPassword(newPassword);
      db.updateUserPassword(user.id, newHash);
      await updateProfilePasswordInCloud(user.id, newHash);

      return NextResponse.json({
        success: true,
        message: 'Password has been successfully updated. Please log in with your new password.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
