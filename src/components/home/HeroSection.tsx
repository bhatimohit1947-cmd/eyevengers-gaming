'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Gift, ArrowDown, Award, Eye } from 'lucide-react';
import { MandalaMotif, ToranBorder, DiyaIcon, FestiveStar } from '../ui/FestiveMotifs';
import { SessionUser } from '@/lib/types';

interface HeroSectionProps {
  user: SessionUser | null;
  campaignName?: string;
}

export function HeroSection({ user, campaignName = 'Navratri & Festive Optical Mahotsav 2026' }: HeroSectionProps) {
  const scrollToGames = () => {
    const el = document.getElementById('games');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-[#2D0922]/90 via-[#400B2E]/80 to-[#1F0717]">
      {/* Decorative Toran Arch at top */}
      <ToranBorder className="mb-4" />

      {/* Multicolored Festive Lighting Glow Halos */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#FF1493]/25 via-[#FFD700]/30 to-[#00E5FF]/25 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#FF6D00]/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#00E5FF]/20 blur-3xl pointer-events-none rounded-full" />

      {/* Background Indian Mandalas with glowing rotation */}
      <div className="absolute top-1/4 -left-16 opacity-25 pointer-events-none animate-float">
        <MandalaMotif className="w-80 h-80 text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
      </div>
      <div className="absolute top-1/3 -right-20 opacity-25 pointer-events-none animate-float" style={{ animationDelay: '2.5s' }}>
        <MandalaMotif className="w-80 h-80 text-[#FF1493] drop-shadow-[0_0_20px_rgba(255,20,147,0.4)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Festival Campaign Tag with Colorful Festive Border */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF1493]/30 via-[#FFD700]/25 to-[#00E5FF]/30 border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)] mb-6 animate-pulse">
          <DiyaIcon className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_8px_#FFD700]" />
          <span className="text-xs sm:text-sm font-black text-[#FFFDF7] tracking-wider uppercase">
            ✨ {campaignName} ✨
          </span>
          <FestiveStar className="w-3.5 h-3.5 text-[#00E5FF]" />
        </div>

        {/* Big Bold Radiant Headline with Illuminated Lighting Effects */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#FFFDF7] tracking-tight leading-none mb-4">
          PLAY.{' '}
          <span className="festive-gold-gradient drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]">
            SPIN.
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1493] via-[#FFD700] to-[#00E5FF] drop-shadow-[0_0_25px_rgba(255,20,147,0.6)]">
            WIN.
          </span>
        </h1>

        {/* Subtitle with Bright Festive Highlight */}
        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-[#FFFDF7]/90 font-medium leading-relaxed mb-8 drop-shadow">
          Celebrate the festival of lights & colors with joyful rewards from{' '}
          <span className="font-black text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/40 shadow-[0_0_12px_rgba(255,215,0,0.3)]">
            EYEVENGERS
          </span>
          . Play our festive games for instant digital vouchers, branded sunglasses, and premium eye consultations in Jodhpur!
        </p>

        {/* Interactive Call to Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
          <button
            onClick={scrollToGames}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFF6BD] via-[#FFD700] to-[#FF9100] text-[#1F0717] font-black text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.6)] flex items-center justify-center gap-2 border border-[#FFFDF7]/60"
          >
            <Sparkles className="w-5 h-5 text-[#B31237]" />
            <span>Play Festive Games</span>
            <ArrowDown className="w-4 h-4 ml-1 animate-bounce" />
          </button>

          {user ? (
            <Link
              href="/my-rewards"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#2A0921]/90 border-2 border-[#FF1493] hover:border-[#FFD700] text-[#FFFDF7] font-bold text-sm sm:text-base hover:bg-[#FF1493]/20 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,20,147,0.3)]"
            >
              <Gift className="w-5 h-5 text-[#FF1493]" />
              <span>View My Vouchers</span>
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#2A0921]/90 border-2 border-[#FFD700]/60 hover:border-[#FFD700] text-[#FFFDF7] font-bold text-sm sm:text-base hover:bg-[#FFD700]/20 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.25)]"
            >
              <Award className="w-5 h-5 text-[#FFD700]" />
              <span>Register & Play Free</span>
            </Link>
          )}
        </div>

        {/* Highlight Feature Badges with 4 Vibrant Festive Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 border-t-2 border-[#FFD700]/25">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#2E0B25]/85 border-2 border-[#FFD700]/60 shadow-[0_0_15px_rgba(255,215,0,0.25)] flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-[#FFD700] drop-shadow-[0_0_10px_#FFD700]">100%</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF7] font-bold mt-0.5">Guaranteed Prizes</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#2E0B25]/85 border-2 border-[#FF1493]/60 shadow-[0_0_15px_rgba(255,20,147,0.25)] flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-[#FF1493] drop-shadow-[0_0_10px_#FF1493]">Instant</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF7] font-bold mt-0.5">Digital PDF Voucher</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#2E0B25]/85 border-2 border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.25)] flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-[#00E5FF] drop-shadow-[0_0_10px_#00E5FF]">Free</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF7] font-bold mt-0.5">Eye Vision Checkup</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#2E0B25]/85 border-2 border-[#00E676]/60 shadow-[0_0_15px_rgba(0,230,118,0.25)] flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-[#00E676] drop-shadow-[0_0_10px_#00E676]">Jodhpur</span>
            <span className="text-[11px] sm:text-xs text-[#FFFDF7] font-bold mt-0.5">Sardarpura Showroom</span>
          </div>
        </div>

      </div>
    </section>
  );
}
