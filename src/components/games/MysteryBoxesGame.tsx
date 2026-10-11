'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, ArrowRight, AlertCircle, RefreshCw, Trophy, FileText } from 'lucide-react';
import Link from 'next/link';
import { MandalaMotif, ToranBorder, DandiyaIcon } from '../ui/FestiveMotifs';

interface MysteryBoxesGameProps {
  initialRemainingPlays?: number;
  initialUser?: { id: string; name: string } | null;
}

export function MysteryBoxesGame({ 
  initialRemainingPlays = 1,
  initialUser = null
}: MysteryBoxesGameProps) {
  const [remainingPlays, setRemainingPlays] = useState(initialRemainingPlays);
  const [user, setUser] = useState<{ id: string; name: string } | null>(initialUser);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedBoxIndex, setRevealedBoxIndex] = useState<number | null>(null);
  const [wonReward, setWonReward] = useState<{
    name: string;
    description?: string;
    valueDisplay: string;
    voucherCode: string;
    voucherId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games/status')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        if (data.plays) {
          setRemainingPlays(data.plays.boxRemaining);
        }
      })
      .catch(() => {});
  }, []);

  const handleBoxSelect = async (boxIndex: number) => {
    if (isOpening || revealedBoxIndex !== null) return;

    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent('/games/boxes')}`;
      return;
    }

    if (remainingPlays <= 0) {
      window.location.href = '/my-rewards';
      return;
    }

    setSelectedBoxIndex(boxIndex);
    setIsOpening(true);
    setErrorMessage(null);

    try {
      // 1. Server-side allocation
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'mystery_box',
          boxIndex,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsOpening(false);
        setSelectedBoxIndex(null);
        setErrorMessage(data.error || 'Failed to open mystery box.');
        return;
      }

      // 2. Play 3D Lid Opening Animation (1.5 seconds)
      setTimeout(() => {
        setIsOpening(false);
        setRevealedBoxIndex(boxIndex);
        setRemainingPlays(data.remainingPlays);
        setWonReward({
          name: data.reward.name,
          description: data.reward.description,
          valueDisplay: data.reward.valueDisplay,
          voucherCode: data.voucher.voucherCode,
          voucherId: data.voucher.id,
        });

        // Trigger golden particle fireworks
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#FF5149', '#E8C477', '#FFF1CF', '#C93B3B'],
        });
      }, 1600);

    } catch {
      setIsOpening(false);
      setSelectedBoxIndex(null);
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  const boxColors = [
    { base: 'from-[#681F2B] to-[#381119]', border: 'border-[#E8C477]/60', ribbon: 'bg-[#E8C477]' },
    { base: 'from-[#8C1D40] to-[#450F20]', border: 'border-[#FF5149]/60', ribbon: 'bg-[#FFF1CF]' },
    { base: 'from-[#4D1525] to-[#250810]', border: 'border-[#D4AF37]/60', ribbon: 'bg-[#D4AF37]' },
    { base: 'from-[#731E30] to-[#3D0E19]', border: 'border-[#E8C477]/60', ribbon: 'bg-[#FF5149]' },
    { base: 'from-[#5C1726] to-[#2A0A12]', border: 'border-[#FF5149]/60', ribbon: 'bg-[#E8C477]' },
    { base: 'from-[#94233D] to-[#4E101E]', border: 'border-[#D4AF37]/60', ribbon: 'bg-[#FFF1CF]' },
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8">
      <ToranBorder className="mb-4" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#FF5149] mb-2">
          <DandiyaIcon className="w-3.5 h-3.5 text-[#E8C477]" />
          <span>Navratri Mystery Gift Reveal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#FFF4E3] tracking-tight">
          Choose Your Mystery Box
        </h1>
        <p className="text-sm sm:text-base text-[#FFF4E3]/80 mt-2 max-w-xl mx-auto">
          Tap an illuminated festive gift box below to unwrap your surprise eyewear voucher!
        </p>

        <div className="inline-block mt-4 px-4 py-1.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/40 text-xs font-bold text-[#FFF1CF]">
          Chances Remaining: <span className={`${remainingPlays > 0 ? 'text-[#00E676]' : 'text-gray-400'} text-sm font-black`}>
            {user ? `${remainingPlays} Left` : '1 Free'}
          </span>
        </div>
      </div>

      {/* Auth / Played Notification Banners */}
      {!user && (
        <div className="mb-8 p-4 rounded-2xl bg-[#2A0921]/90 border border-[#FFD700]/50 max-w-md mx-auto text-center space-y-2 shadow-lg">
          <p className="text-xs text-[#FFF4E3]/90">
            Log in with your mobile number to unlock and claim your free festive gift!
          </p>
          <Link
            href="/auth/login?redirect=/games/boxes"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFE066] to-[#FFD700] text-[#1F0717] font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
          >
            <span>Log In & Open Box ➔</span>
          </Link>
        </div>
      )}

      {user && remainingPlays <= 0 && revealedBoxIndex === null && (
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#2A0921]/90 border-2 border-[#00E676]/60 shadow-[0_0_25px_rgba(0,230,118,0.25)] max-w-lg mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-black">
            <span>✓ Mystery Box Played (0 Chances Left)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#FFFDF7]">
            You have already unwrapped your Mystery Gift Box!
          </h3>
          <p className="text-xs text-[#FFF4E3]/80">
            Your digital discount voucher is ready in your wallet. Present it at the EYEVENGERS showroom to redeem.
          </p>
          <Link
            href="/my-rewards"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-[#1F0717] font-black text-xs sm:text-sm shadow-lg hover:scale-105 transition-transform"
          >
            <span>View My Reward Voucher 🎟️</span>
          </Link>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3D PERSPECTIVE BOX GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto my-8 perspective-1000">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const isSelected = selectedBoxIndex === index;
          const isRevealed = revealedBoxIndex === index;
          const styling = boxColors[index % boxColors.length];

          return (
            <button
              key={index}
              onClick={() => handleBoxSelect(index)}
              disabled={isOpening || revealedBoxIndex !== null}
              className={`group relative h-48 sm:h-56 rounded-2xl bg-gradient-to-br ${styling.base} border-2 ${styling.border} p-4 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                remainingPlays > 0 && revealedBoxIndex === null
                  ? 'hover:-translate-y-2 hover:shadow-[0_20px_35px_rgba(232,196,119,0.25)]'
                  : 'hover:border-[#00E676]/60'
              } ${isSelected && isOpening ? 'animate-pulse scale-105 border-[#E8C477]' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Ribbon Vertical */}
              <div className={`absolute inset-y-0 left-1/2 w-4 ${styling.ribbon} -translate-x-1/2 opacity-90 shadow-md`} />
              {/* Ribbon Horizontal */}
              <div className={`absolute inset-x-0 top-1/2 h-4 ${styling.ribbon} -translate-y-1/2 opacity-90 shadow-md`} />

              {/* 3D Lid Top Accent */}
              <div
                className={`absolute -top-3 w-20 h-6 rounded-md bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] border border-[#21171A] shadow-md transition-transform duration-500 flex items-center justify-center text-[10px] font-black text-[#21171A] ${
                  isSelected && isOpening ? '-translate-y-6 rotate-12' : ''
                }`}
              >
                BOX #{index + 1}
              </div>

              {/* Center Bow / Crest */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-[#21171A] border-2 border-[#E8C477] flex items-center justify-center text-[#E8C477] shadow-lg group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-[#FFF1CF]" />
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-3 inset-x-0 text-center z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FFF1CF] bg-[#21171A]/80 px-2.5 py-0.5 rounded-full border border-[#E8C477]/30">
                  {isSelected && isOpening 
                    ? 'Opening...' 
                    : isRevealed 
                    ? 'Opened' 
                    : remainingPlays <= 0 
                    ? 'View Voucher ↗' 
                    : 'Open Box'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Rules Notice */}
      <div className="mt-12 p-6 rounded-2xl bg-[#2A171D]/80 border border-[#E8C477]/30 max-w-2xl mx-auto text-xs text-[#FFF4E3]/80 space-y-2">
        <h3 className="font-black text-[#FF5149] uppercase tracking-wider text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-[#E8C477]" />
          <span>Mystery Box Rules & Information</span>
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>1 Mystery Box opening eligible per customer during this campaign.</li>
          <li>Every single box holds a real verified eyewear voucher.</li>
          <li>All prizes are cryptographically assigned server-side for fairness.</li>
          <li>Download or save your digital PDF voucher to redeem at our Jodhpur showroom.</li>
        </ul>
      </div>

      {/* REWARD REVEAL MODAL */}
      {wonReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#2D161F] via-[#3E1624] to-[#21171A] border-2 border-[#FF5149] p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(255,81,73,0.4)]">
            
            <div className="w-20 h-20 mx-auto rounded-full bg-[#681F2B] border-2 border-[#FF5149] flex items-center justify-center text-[#FFF1CF] mb-4 shadow-xl animate-bounce">
              <Gift className="w-10 h-10 text-[#E8C477]" />
            </div>

            <div className="text-xs uppercase tracking-widest text-[#E8C477] font-black mb-1">
              Festive Mystery Unwrapped!
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#FFF4E3] mb-2">
              Congratulations!
            </h2>

            <div className="p-4 my-4 rounded-2xl bg-[#21171A] border border-[#FF5149]/40">
              <div className="text-xl sm:text-2xl font-black text-[#FF5149]">
                {wonReward.name}
              </div>
              <div className="text-xs text-[#FFF4E3]/80 mt-1">
                Value: <span className="font-bold text-[#FFF1CF]">{wonReward.valueDisplay}</span>
              </div>
              <div className="text-[11px] text-[#E8C477] font-mono mt-2 font-bold tracking-wider">
                VOUCHER CODE: {wonReward.voucherCode}
              </div>
            </div>

            <p className="text-xs text-[#FFF4E3]/70 mb-6">
              Your digital festive voucher has been saved in your rewards wallet. Present it at the EYEVENGERS showroom (137, Jhanwar Rd, Bhadu Market, Jodhpur).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href="/my-rewards"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5149] via-[#C93B3B] to-[#681F2B] text-[#FFF4E3] font-black text-xs sm:text-sm hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Voucher in Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setWonReward(null)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/40 text-[#FFF4E3] font-bold text-xs hover:bg-[#681F2B]/50 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
