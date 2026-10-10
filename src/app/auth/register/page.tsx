'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ToranBorder, MandalaMotif } from '@/components/ui/FestiveMotifs';
import { User, Phone, Lock, CheckSquare, Square, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage('Please accept the festive promotion terms & conditions to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          password,
          termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. Please check your details.');
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setErrorMessage('Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#2A171D] py-8 px-6 sm:px-10 rounded-3xl border border-[#E8C477]/35 shadow-[0_0_35px_rgba(232,196,119,0.15)]">
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none focus:border-[#E8C477]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
            Mobile Number
          </label>
          <div className="relative flex rounded-xl border border-[#E8C477]/30 bg-[#21171A] overflow-hidden focus-within:border-[#E8C477]">
            <div className="px-3.5 py-3 bg-[#681F2B]/50 border-r border-[#E8C477]/30 text-xs font-bold text-[#FFF1CF] flex items-center gap-1">
              <span>🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              required
              placeholder="98290 12345"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-3 bg-transparent text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Used to verify vouchers at the EYEVENGERS showroom.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none focus:border-[#E8C477]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#E8C477] uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none focus:border-[#E8C477]"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#FFF4E3]/80 select-none">
            <button
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="mt-0.5 text-[#E8C477] shrink-0"
            >
              {termsAccepted ? (
                <CheckSquare className="w-4 h-4 text-[#E8C477]" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-[#E8C477] underline" target="_blank">
                Festive Promotional Terms
              </Link>{' '}
              and showroom voucher conditions.
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-sm hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Register & Start Playing</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-[#FFF4E3]/70 border-t border-[#E8C477]/20 pt-4">
        Already have an account?{' '}
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-[#E8C477] hover:underline"
        >
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#21171A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <MandalaMotif className="w-80 h-80 text-[#E8C477]" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
        <MandalaMotif className="w-80 h-80 text-[#FF5149]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <BrandLogo size="lg" className="justify-center" />
        <ToranBorder className="my-4" />
        <h2 className="text-2xl sm:text-3xl font-black text-[#FFF4E3] tracking-tight">
          Create Your Festive Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#FFF4E3]/70">
          Register to play Lucky Spin Wheel, open Mystery Boxes, and receive official showroom vouchers.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-gray-400 text-xs">Loading registration...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
