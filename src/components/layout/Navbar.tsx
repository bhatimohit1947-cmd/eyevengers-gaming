'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '../ui/BrandLogo';
import { SessionUser } from '@/lib/types';
import { 
  Gift, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Scan,
  Compass
} from 'lucide-react';
import { DandiyaIcon } from '../ui/FestiveMotifs';
import { FestiveLights } from '../ui/FestiveLights';

export function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setUserDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2A0820]/95 backdrop-blur-md border-b-2 border-[#FFD700]/40 shadow-[0_4px_25px_rgba(255,215,0,0.15)]">
      <FestiveLights />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Festive Tag */}
        <div className="flex items-center gap-4">
          <BrandLogo size="md" />
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#681F2B]/80 border border-[#FFD700]/40 text-xs font-bold text-[#FFF1CF] shadow-sm">
            <DandiyaIcon className="w-4 h-4 text-[#FFD700]" />
            <span>Navratri Mahotsav 2026</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link 
            href="/" 
            className="text-[#FFF4E3] hover:text-[#E8C477] transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/#games" 
            className="text-[#FFF4E3] hover:text-[#E8C477] transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-[#E8C477]" />
            <span>Games</span>
          </Link>
          {user && (
            <Link 
              href="/my-rewards" 
              className="text-[#FFF4E3] hover:text-[#E8C477] transition-colors flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-[#FF5149]" />
              <span>My Rewards</span>
            </Link>
          )}
          {user && (user.role === 'staff' || user.role === 'admin') && (
            <Link 
              href="/staff/redeem" 
              className="text-[#FFF1CF] bg-[#681F2B] hover:bg-[#852535] px-3 py-1.5 rounded-lg border border-[#E8C477]/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Scan className="w-3.5 h-3.5 text-[#E8C477]" />
              <span>Showroom Desk</span>
            </Link>
          )}
        </nav>

        {/* Right: Auth Profile / Login */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#2A171D] border border-[#E8C477]/30 hover:border-[#E8C477] transition-all text-sm text-[#FFF4E3]"
              >
                <div className="w-8 h-8 rounded-full bg-[#681F2B] flex items-center justify-center text-[#E8C477] font-bold text-xs border border-[#E8C477]/40">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs leading-none">{user.fullName.split(' ')[0]}</div>
                  <div className="text-[10px] text-[#E8C477]/80 capitalize">{user.role}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#21171A] border border-[#E8C477]/40 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E8C477]/20 text-xs text-[#FFF4E3]">
                    <p className="font-bold">{user.fullName}</p>
                    <p className="text-[11px] text-gray-400">{user.mobile}</p>
                  </div>
                  <Link
                    href="/my-rewards"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#FFF4E3] hover:bg-[#681F2B]/40 hover:text-[#E8C477]"
                  >
                    <Gift className="w-3.5 h-3.5 text-[#FF5149]" />
                    <span>My Vouchers</span>
                  </Link>
                  {user.role === 'staff' && (
                    <Link
                      href="/staff/redeem"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#FFF4E3] hover:bg-[#681F2B]/40 hover:text-[#E8C477]"
                    >
                      <Scan className="w-3.5 h-3.5 text-[#E8C477]" />
                      <span>Redemption Scanner</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#681F2B]/40 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-xs font-semibold text-[#FFF4E3] hover:text-[#E8C477] px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="text-xs font-bold text-[#21171A] bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] hover:brightness-110 px-4 py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(232,196,119,0.3)]"
              >
                Play & Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#FFF4E3] hover:bg-[#681F2B]/40 border border-[#E8C477]/30"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#21171A] border-b border-[#E8C477]/30 px-6 py-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8C477]/20">
            <DandiyaIcon className="w-4 h-4 text-[#E8C477]" />
            <span className="text-xs text-[#FFF1CF] font-bold">Navratri Mahotsav 2026</span>
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#FFF4E3] hover:text-[#E8C477]"
          >
            Home
          </Link>
          <Link
            href="/#games"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#FFF4E3] hover:text-[#E8C477]"
          >
            Explore Games
          </Link>
          {user && (
            <Link
              href="/my-rewards"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[#FF5149] hover:text-[#E8C477]"
            >
              My Rewards & Vouchers
            </Link>
          )}
          {user && (user.role === 'staff' || user.role === 'admin') && (
            <Link
              href="/staff/redeem"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-[#E8C477]"
            >
              Showroom Voucher Desk
            </Link>
          )}

          <div className="pt-4 border-t border-[#E8C477]/20">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs text-gray-300">
                  Signed in as <span className="font-bold text-[#FFF4E3]">{user.fullName}</span> ({user.mobile})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg border border-[#E8C477]/40 text-center text-xs font-bold text-[#FFF4E3]"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FFF1CF] to-[#E8C477] text-center text-xs font-bold text-[#21171A]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
