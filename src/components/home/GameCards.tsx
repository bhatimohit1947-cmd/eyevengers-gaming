'use client';

import React from 'react';
import Link from 'next/link';
import { SessionUser } from '@/lib/types';
import { Gift, ArrowRight } from 'lucide-react';
import { MandalaMotif, DandiyaIcon } from '../ui/FestiveMotifs';
import { FestiveLights } from '../ui/FestiveLights';

interface GameCardsProps {
  user: SessionUser | null;
  spinRemaining?: number;
  boxRemaining?: number;
  spinEnabled?: boolean;
  boxEnabled?: boolean;
}

export function GameCards({
  user,
  spinRemaining = 1,
  boxRemaining = 1,
  spinEnabled = true,
  boxEnabled = true,
}: GameCardsProps) {
  const [currentSpinRemaining, setCurrentSpinRemaining] = React.useState(spinRemaining);
  const [currentBoxRemaining, setCurrentBoxRemaining] = React.useState(boxRemaining);

  React.useEffect(() => {
    setCurrentSpinRemaining(spinRemaining);
    setCurrentBoxRemaining(boxRemaining);

    if (user) {
      fetch('/api/games/status')
        .then(res => res.json())
        .then(data => {
          if (data.plays) {
            if (typeof data.plays.spinRemaining === 'number') {
              setCurrentSpinRemaining(data.plays.spinRemaining);
            }
            if (typeof data.plays.boxRemaining === 'number') {
              setCurrentBoxRemaining(data.plays.boxRemaining);
            }
          }
        })
        .catch(() => {});
    }
  }, [user, spinRemaining, boxRemaining]);

  const getPlayHref = (target: string) => {
    if (!user) {
      return `/auth/login?redirect=${encodeURIComponent(target)}`;
    }
    return target;
  };

  return (
    <section id="games" className="py-10 sm:py-16 md:py-20 relative">
      {/* Illuminated Festive Lights Strand over Games */}
      <div className="mb-6">
        <FestiveLights />
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Heading with Colorful Festive Tag */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF1493]/30 via-[#FFD700]/30 to-[#00E5FF]/30 border border-[#FFD700]/60 text-xs font-bold text-[#FFD700] mb-3 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            <DandiyaIcon className="w-3.5 h-3.5 text-[#FF1493]" />
            <span className="uppercase tracking-wider">Navratri Festive Games</span>
            <DandiyaIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#FFFDF7] tracking-tight mb-2 sm:mb-3">
            Choose Your Festive Game
          </h2>
          <p className="text-xs sm:text-sm text-[#FFFDF7]/80 max-w-lg mx-auto">
            100% guaranteed showroom vouchers, free designer sunglasses, and optical packages!
          </p>
        </div>

        {/* 2 MAIN GAME CARDS — SIDE-BY-SIDE ON MOBILE (grid-cols-2) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-10 max-w-5xl mx-auto">
          
          {/* GAME CARD A (LEFT ON MOBILE): LUCKY SPIN WHEEL */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#400B29] via-[#2A071C] to-[#170410] border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.3)] overflow-hidden flex flex-col justify-between group hover:shadow-[0_0_35px_rgba(255,215,0,0.5)] transition-all duration-300">
            
            <div className="p-2.5 sm:p-6 md:p-8">
              {/* Header with non-overlapping flexbox */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-[#FFD700] uppercase tracking-wider truncate">
                  <DandiyaIcon className="w-3 h-3 shrink-0 text-[#FFD700]" />
                  <span className="truncate">Prize Wheel</span>
                </div>
                <span className="px-1.5 sm:px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FFE066] to-[#FFD700] text-[#1F0717] text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-md shrink-0">
                  Popular
                </span>
              </div>

              <h3 className="text-sm sm:text-2xl md:text-3xl font-black text-[#FFFDF7] mb-1 sm:mb-2 leading-tight">
                Lucky Spin
              </h3>

              <p className="hidden sm:block text-xs sm:text-sm text-[#FFFDF7]/80 mb-4 leading-relaxed">
                Spin the golden jewel wheel and discover your festive reward up to ₹200 OFF and free sunglasses!
              </p>

              {/* Graphical Preview of Prize Wheel */}
              <div className="relative w-full h-24 sm:h-44 md:h-52 flex items-center justify-center my-1.5 sm:my-4 overflow-hidden rounded-xl sm:rounded-2xl bg-[#1A0514]/80 border border-[#FFD700]/30 shadow-inner">
                {/* Simulated Colorful Wheel Motif */}
                <div 
                  className="relative w-16 h-16 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-2 sm:border-4 border-[#FFD700] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.4)] animate-spin" 
                  style={{ animationDuration: '20s' }}
                >
                  <MandalaMotif className="w-full h-full text-[#FFD700]" />
                </div>
                {/* Center Hub */}
                <div className="absolute w-6 h-6 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#FFF6BD] via-[#FFD700] to-[#FF8C00] border sm:border-2 border-[#1F0717] flex items-center justify-center shadow-lg">
                  <span className="text-[6px] sm:text-[10px] font-black text-[#1F0717]">SPIN</span>
                </div>
                {/* Pointer Indicator */}
                <div className="absolute top-1 sm:top-2 w-2.5 sm:w-4 h-3.5 sm:h-6 bg-[#FF1493] shadow-md" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>

              {/* Status & Play Counts */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#FFFDF7]/70 pt-1.5 sm:pt-2 mb-2 sm:mb-4 border-t border-[#FFD700]/20">
                <span className="truncate">Chances:</span>
                <span className={`font-bold text-xs sm:text-sm shrink-0 ${user && currentSpinRemaining === 0 ? 'text-[#00E676]' : 'text-[#FFD700]'}`}>
                  {user ? (currentSpinRemaining > 0 ? `${currentSpinRemaining} Left` : '0 Left (Claimed)') : '1 Free'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-2.5 sm:p-6 md:p-8 pt-0">
              <Link
                href={user ? (currentSpinRemaining > 0 ? '/games/spin' : '/my-rewards') : '/auth/login?redirect=/games/spin'}
                className={`w-full py-2 sm:py-3.5 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1 sm:gap-2 font-black text-[11px] sm:text-sm md:text-base transition-all shadow-lg ${
                  spinEnabled
                    ? (user && currentSpinRemaining === 0
                        ? 'bg-[#2A0921] border-2 border-[#00E676]/60 text-[#00E676] hover:bg-[#00E676]/20 shadow-[0_0_15px_rgba(0,230,118,0.25)]'
                        : 'bg-gradient-to-r from-[#FFF6BD] via-[#FFD700] to-[#FFA200] text-[#1F0717] hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-95')
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                <span className="truncate">
                  {user 
                    ? (currentSpinRemaining > 0 ? 'Spin Wheel' : 'View Voucher ↗') 
                    : 'Login & Spin'}
                </span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* GAME CARD B (RIGHT ON MOBILE): MYSTERY BOXES */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#400B29] via-[#2A071C] to-[#170410] border-2 border-[#FF1493] shadow-[0_0_25px_rgba(255,20,147,0.3)] overflow-hidden flex flex-col justify-between group hover:shadow-[0_0_35px_rgba(255,20,147,0.5)] transition-all duration-300">
            
            <div className="p-2.5 sm:p-6 md:p-8">
              {/* Header with non-overlapping flexbox */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-[#FF1493] uppercase tracking-wider truncate">
                  <Gift className="w-3 h-3 shrink-0 text-[#FF1493]" />
                  <span className="truncate">Gift Boxes</span>
                </div>
                <span className="px-1.5 sm:px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FF1493] to-[#E60067] text-[#FFFDF7] text-[8px] sm:text-xs font-black uppercase tracking-wider shadow-md shrink-0">
                  Mystery
                </span>
              </div>

              <h3 className="text-sm sm:text-2xl md:text-3xl font-black text-[#FFFDF7] mb-1 sm:mb-2 leading-tight">
                Mystery Box
              </h3>

              <p className="hidden sm:block text-xs sm:text-sm text-[#FFFDF7]/80 mb-4 leading-relaxed">
                Choose an illuminated gift box and unwrap guaranteed eyewear discounts and vision checkups!
              </p>

              {/* Graphical Preview of 3D Gift Boxes */}
              <div className="relative w-full h-24 sm:h-44 md:h-52 flex items-center justify-center gap-1 sm:gap-3 my-1.5 sm:my-4 px-1 overflow-hidden rounded-xl sm:rounded-2xl bg-[#1A0514]/80 border border-[#FF1493]/30 shadow-inner">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative w-7 h-11 sm:w-16 sm:h-22 md:w-20 md:h-26 rounded-md sm:rounded-xl bg-gradient-to-br from-[#E60067] to-[#7A0636] border border-[#FFD700]/70 shadow-lg flex flex-col items-center justify-center transform transition-transform group-hover:scale-105 shrink-0"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Ribbon cross */}
                    <div className="absolute inset-x-0 top-1/2 h-1 sm:h-2 bg-[#FFD700] -translate-y-1/2 shadow-sm" />
                    <div className="absolute inset-y-0 left-1/2 w-1 sm:w-2 bg-[#FFD700] -translate-x-1/2 shadow-sm" />
                    {/* Top Bow */}
                    <div className="absolute -top-1 w-3.5 h-2.5 sm:w-5 sm:h-4 rounded-full border border-[#FFD700] bg-[#FF1493] flex items-center justify-center text-[6px] text-[#FFD700] font-bold">
                      ★
                    </div>
                    <span className="text-[8px] sm:text-xs font-black text-[#FFFDF7] relative z-10 pt-0.5">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status & Play Counts */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#FFFDF7]/70 pt-1.5 sm:pt-2 mb-2 sm:mb-4 border-t border-[#FF1493]/20">
                <span className="truncate">Chances:</span>
                <span className={`font-bold text-xs sm:text-sm shrink-0 ${user && currentBoxRemaining === 0 ? 'text-[#00E676]' : 'text-[#FF1493]'}`}>
                  {user ? (currentBoxRemaining > 0 ? `${currentBoxRemaining} Left` : '0 Left (Claimed)') : '1 Free'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-2.5 sm:p-6 md:p-8 pt-0">
              <Link
                href={user ? (currentBoxRemaining > 0 ? '/games/boxes' : '/my-rewards') : '/auth/login?redirect=/games/boxes'}
                className={`w-full py-2 sm:py-3.5 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1 sm:gap-2 font-black text-[11px] sm:text-sm md:text-base transition-all shadow-lg ${
                  boxEnabled
                    ? (user && currentBoxRemaining === 0
                        ? 'bg-[#2A0921] border-2 border-[#00E676]/60 text-[#00E676] hover:bg-[#00E676]/20 shadow-[0_0_15px_rgba(0,230,118,0.25)]'
                        : 'bg-gradient-to-r from-[#FF1493] via-[#E60067] to-[#B31237] text-[#FFFDF7] hover:brightness-110 shadow-[0_0_20px_rgba(255,20,147,0.4)] active:scale-95')
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                <span className="truncate">
                  {user 
                    ? (currentBoxRemaining > 0 ? 'Open Gift Box' : 'View Voucher ↗') 
                    : 'Login & Open'}
                </span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
