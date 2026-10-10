'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ToranBorder, MandalaMotif } from '@/components/ui/FestiveMotifs';
import { Phone, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', mobile }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to dispatch OTP.');
        return;
      }

      setMessage('OTP has been dispatched to your mobile number.');
      if (data.devOtp) {
        setDevOtpCode(data.devOtp);
        setOtp(data.devOtp); // pre-fill in dev mode
      }
      setStep('reset');
    } catch {
      setErrorMessage('Server error. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          mobile,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to reset password.');
        return;
      }

      setMessage('Password successfully reset! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch {
      setErrorMessage('Server error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#21171A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <MandalaMotif className="w-80 h-80 text-[#E8C477]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <BrandLogo size="lg" className="justify-center" />
        <ToranBorder className="my-4" />
        <h2 className="text-2xl sm:text-3xl font-black text-[#FFF4E3] tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#FFF4E3]/70">
          Verify your mobile number to set a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#2A171D] py-8 px-6 sm:px-10 rounded-3xl border border-[#E8C477]/35 shadow-[0_0_35px_rgba(232,196,119,0.15)]">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <div className="relative flex rounded-xl border border-[#E8C477]/30 bg-[#21171A] overflow-hidden focus-within:border-[#E8C477]">
                  <div className="px-3.5 py-3 bg-[#681F2B]/50 border-r border-[#E8C477]/30 text-xs font-bold text-[#FFF1CF] flex items-center gap-1">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-3 bg-transparent text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-sm hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span>Sending OTP...</span> : <span>Send Verification OTP</span>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {devOtpCode && (
                <div className="p-3 rounded-lg bg-[#681F2B]/60 border border-[#E8C477]/40 text-xs text-[#FFF1CF]">
                  <span className="font-bold text-[#E8C477]">Dev Mode OTP:</span> {devOtpCode}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-[#E8C477]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none focus:border-[#E8C477]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-sm hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span>Updating Password...</span> : <span>Confirm New Password</span>}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-xs text-gray-400 hover:text-[#E8C477]"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-[#FFF4E3]/70 border-t border-[#E8C477]/20 pt-4">
            Remembered your password?{' '}
            <Link href="/auth/login" className="font-bold text-[#E8C477] hover:underline">
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
