import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeMobile, hashPassword } from '@/lib/auth/password';
import { sendOtp, verifyOtp } from '@/lib/auth/smsProvider';

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
      const user = db.getUserByMobile(normalizedMobile);
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
        devOtp: smsRes.devOtp, // For quick testing in development
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

      const user = db.getUserByMobile(normalizedMobile);
      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }

      const newHash = await hashPassword(newPassword);
      db.updateUserPassword(user.id, newHash);

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
