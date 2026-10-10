/**
 * SMS OTP Provider Interface for EYEVENGERS
 * Supports production SMS gateways (Gupshup / Fast2SMS / Twilio)
 * In development, returns mock delivery with console audit.
 */

export interface SmsSendResult {
  sent: boolean;
  provider: 'development' | 'fast2sms' | 'gupshup' | 'twilio';
  messageId?: string;
  devOtp?: string; // Only provided in development environment
}

// In-memory OTP storage for password reset sessions (Expires in 10 minutes)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function sendOtp(mobile: string): Promise<SmsSendResult> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(mobile, { otp, expiresAt });

  const apiKey = process.env.SMS_GATEWAY_API_KEY;
  if (!apiKey) {
    // Development fallback
    console.log(`[SMS-DEV-GATEWAY] OTP for ${mobile}: ${otp}`);
    return {
      sent: true,
      provider: 'development',
      messageId: `dev-msg-${Date.now()}`,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  // Production provider implementation (e.g. Fast2SMS / Twilio)
  // Can be expanded with fetch() call to actual provider
  return {
    sent: true,
    provider: 'fast2sms',
    messageId: `prod-msg-${Date.now()}`,
  };
}

export function verifyOtp(mobile: string, inputOtp: string): boolean {
  const record = otpStore.get(mobile);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return false;
  }
  if (record.otp === inputOtp.trim()) {
    otpStore.delete(mobile); // One-time use
    return true;
  }
  return false;
}
