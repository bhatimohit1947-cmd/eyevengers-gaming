'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ToranBorder, MandalaMotif } from '@/components/ui/FestiveMotifs';
import { Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid mobile number or password.');
        setLoading(false);
        return;
      }

      let target = redirect || '/';
      if (data.user?.role === 'admin') {
        target = '/admin';
      } else if (data.user?.role === 'staff' && (redirect === '/' || !redirect)) {
        target = '/staff/redeem';
      }
      window.location.href = target;
    } catch {
      setErrorMessage('Connection error. Please try again.');
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
            Mobile Number
          </label>
          <div className="relative flex rounded-xl border border-[#E8C477]/30 bg-[#21171A] overflow-hidden focus-within:border-[#E8C477]">
            <div className="px-3.5 py-3 bg-[#681F2B]/50 border-r border-[#E8C477]/30 text-xs font-bold text-[#FFF1CF] flex items-center gap-1">
              <span>🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              required
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-3 bg-transparent text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#E8C477] uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] text-[#FF5149] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] placeholder-gray-500 text-sm focus:outline-none focus:border-[#E8C477]"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-sm hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-[#FFF4E3]/70">
        Don’t have an account?{' '}
        <Link
          href={`/auth/register?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-[#E8C477] hover:underline"
        >
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          Sign In to EYEVENGERS
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#FFF4E3]/70">
          Access your festive rewards, play remaining chances, or download voucher PDFs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-gray-400 text-xs">Loading sign-in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
