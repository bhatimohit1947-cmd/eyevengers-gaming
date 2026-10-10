'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, ArrowRight, AlertCircle, RefreshCw, Trophy, FileText } from 'lucide-react';
import Link from 'next/link';
import { MandalaMotif, ToranBorder } from '../ui/FestiveMotifs';

interface RewardSegment {
  id: string;
  name: string;
  rewardType: string;
  valueDisplay: string;
  color?: string;
}

interface SpinWheelGameProps {
  initialRewards?: RewardSegment[];
  initialRemainingPlays?: number;
}

export function SpinWheelGame({
  initialRewards = [],
  initialRemainingPlays = 1,
}: SpinWheelGameProps) {
  const [rewards, setRewards] = useState<RewardSegment[]>(initialRewards);
  const [remainingPlays, setRemainingPlays] = useState(initialRemainingPlays);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wonReward, setWonReward] = useState<{
    name: string;
    description?: string;
    valueDisplay: string;
    voucherCode: string;
    voucherId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch status if initial empty
  useEffect(() => {
    if (initialRewards.length === 0) {
      fetch('/api/games/status')
        .then(res => res.json())
        .then(data => {
          if (data.rewards?.spinWheel) {
            setRewards(data.rewards.spinWheel);
          }
          if (data.plays) {
            setRemainingPlays(data.plays.spinRemaining);
          }
        })
        .catch(() => {});
    }
  }, [initialRewards]);

  // Draw the high-resolution canvas prize wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rewards.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;
    const count = rewards.length;
    const arc = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, size, size);

    // Segment color palette tailored for Navratri festive theme
    const sliceColors = [
      '#681F2B', // Maroon
      '#C93B3B', // Festive Red
      '#2A171D', // Deep Wine
      '#E8C477', // Antique Gold
      '#FF5149', // Coral
      '#852535', // Crimson
      '#44141E', // Dark Plum
      '#D4AF37', // Gold Leaf
      '#B03333', // Ruby Red
      '#531A24', // Deep Mahogany
    ];

    rewards.forEach((item, i) => {
      const angle = i * arc;

      // Draw Slice
      ctx.beginPath();
      ctx.fillStyle = sliceColors[i % sliceColors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      // Golden Slice Border
      ctx.strokeStyle = 'rgba(232, 196, 119, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      const textAngle = angle + arc / 2;
      ctx.translate(center, center);
      ctx.rotate(textAngle);

      const isGoldSlice = sliceColors[i % sliceColors.length] === '#E8C477' || sliceColors[i % sliceColors.length] === '#D4AF37';
      ctx.fillStyle = isGoldSlice ? '#21171A' : '#FFF4E3';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Truncate cleanly for wheel radius
      const label = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
      ctx.fillText(label, radius - 24, 0);

      ctx.restore();
    });

    // Outer Golden Metallic Rim
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E8C477';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 13, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFF1CF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Golden Studs along outer rim
    const studCount = count * 3;
    for (let s = 0; s < studCount; s++) {
      const studAngle = (s * 2 * Math.PI) / studCount;
      const sx = center + (radius + 8) * Math.cos(studAngle);
      const sy = center + (radius + 8) * Math.sin(studAngle);

      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFF1CF';
      ctx.fill();
      ctx.strokeStyle = '#681F2B';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Center Ornate Hub
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#21171A';
    ctx.fill();
    ctx.strokeStyle = '#E8C477';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 36, 0, 2 * Math.PI);
    ctx.fillStyle = '#681F2B';
    ctx.fill();

    ctx.fillStyle = '#FFF1CF';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EYE', center, center - 6);
    ctx.font = '700 9px system-ui, sans-serif';
    ctx.fillText('VENGERS', center, center + 7);
  }, [rewards]);

  const handleSpinClick = async () => {
    if (isSpinning || remainingPlays <= 0) return;

    setErrorMessage(null);
    setIsSpinning(true);

    try {
      // 1. Request Server Allocation
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'spin_wheel' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSpinning(false);
        setErrorMessage(data.error || 'Failed to start game play.');
        return;
      }

      // 2. Compute Target Angle
      // Pointer is at TOP (270 degrees in canvas coordinates)
      const count = rewards.length || 6;
      const targetIndex = data.segmentIndex ?? 0;
      const arcDegree = 360 / count;

      // Center of target slice
      const targetSliceCenter = targetIndex * arcDegree + arcDegree / 2;
      
      // Calculate rotation so that targetSliceCenter lands at 270 degrees
      const spins = 5; // 5 full rotations for drama
      const finalAngle = 360 * spins + (270 - targetSliceCenter);

      setRotationDegree(finalAngle);

      // 3. Complete animation after 5 seconds
      setTimeout(() => {
        setIsSpinning(false);
        setRemainingPlays(data.remainingPlays);
        setWonReward({
          name: data.reward.name,
          description: data.reward.description,
          valueDisplay: data.reward.valueDisplay,
          voucherCode: data.voucher.voucherCode,
          voucherId: data.voucher.id,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E8C477', '#C93B3B', '#FF5149', '#FFF1CF'],
        });
      }, 5200);

    } catch {
      setIsSpinning(false);
      setErrorMessage('Network or server connection issue. Please try again.');
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8">
      <ToranBorder className="mb-4" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#E8C477] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5149]" />
          <span>Navratri Lucky Spin Mahotsav</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#FFF4E3] tracking-tight">
          Lucky Spin Prize Wheel
        </h1>
        <p className="text-sm sm:text-base text-[#FFF4E3]/80 mt-2 max-w-xl mx-auto">
          Spin the wheel to unlock guaranteed showroom rewards, frames, and comprehensive optical care packages!
        </p>

        <div className="inline-block mt-4 px-4 py-1.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/40 text-xs font-bold text-[#FFF1CF]">
          Chances Remaining: <span className="text-[#E8C477] text-sm font-black">{remainingPlays}</span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* WHEEL CONTAINER */}
      <div className="relative flex flex-col items-center justify-center my-6">
        
        {/* Pointer Triangle at Top */}
        <div className="relative z-20 -mb-5 flex flex-col items-center">
          <div className="w-8 h-10 bg-gradient-to-b from-[#FFF1CF] via-[#E8C477] to-[#C93B3B] clip-path-pointer shadow-2xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
               style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
        </div>

        {/* Canvas Wheel with CSS Rotation */}
        <div className="relative p-2 rounded-full bg-gradient-to-br from-[#2D161F] to-[#21171A] border-4 border-[#E8C477]/30 shadow-[0_0_50px_rgba(232,196,119,0.25)]">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] transition-transform"
            style={{
              transform: `rotate(${rotationDegree}deg)`,
              transition: isSpinning
                ? 'transform 5s cubic-bezier(0.12, 0.8, 0.15, 1)'
                : 'none',
            }}
          />
        </div>

        {/* Spin Trigger Button */}
        <div className="mt-8">
          <button
            onClick={handleSpinClick}
            disabled={isSpinning || remainingPlays <= 0}
            className={`px-10 py-4 rounded-2xl font-black text-base sm:text-lg tracking-wider transition-all shadow-2xl flex items-center gap-3 ${
              isSpinning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : remainingPlays > 0
                ? 'bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] hover:scale-105 shadow-[0_0_25px_rgba(232,196,119,0.5)] active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>SPINNING...</span>
              </>
            ) : remainingPlays > 0 ? (
              <>
                <Sparkles className="w-5 h-5" />
                <span>SPIN THE WHEEL</span>
              </>
            ) : (
              <span>LIMIT REACHED</span>
            )}
          </button>
        </div>

      </div>

      {/* Rules Notice */}
      <div className="mt-12 p-6 rounded-2xl bg-[#2A171D]/80 border border-[#E8C477]/30 max-w-2xl mx-auto text-xs text-[#FFF4E3]/80 space-y-2">
        <h3 className="font-black text-[#E8C477] uppercase tracking-wider text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-[#FF5149]" />
          <span>Game Instructions & Terms</span>
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>1 Spin eligible per customer during the festive campaign period.</li>
          <li>All rewards generate an authentic digital voucher with an instant showroom QR code.</li>
          <li>Showroom redemption valid at EYEVENGERS, Sardarpura 9th C Road, Jodhpur.</li>
          <li>Vouchers are valid for 14 calendar days from the date of issue.</li>
        </ul>
      </div>

      {/* REWARD REVEAL MODAL */}
      {wonReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#2D161F] via-[#3E1624] to-[#21171A] border-2 border-[#E8C477] p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(232,196,119,0.4)]">
            
            {/* Ornate Mandala stamp */}
            <div className="w-20 h-20 mx-auto rounded-full bg-[#681F2B] border-2 border-[#E8C477] flex items-center justify-center text-[#E8C477] mb-4 shadow-xl animate-bounce">
              <Gift className="w-10 h-10 text-[#FFF1CF]" />
            </div>

            <div className="text-xs uppercase tracking-widest text-[#FF5149] font-black mb-1">
              Festive Congratulations!
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#FFF4E3] mb-2">
              You Have Won!
            </h2>

            <div className="p-4 my-4 rounded-2xl bg-[#21171A] border border-[#E8C477]/40">
              <div className="text-xl sm:text-2xl font-black text-[#E8C477]">
                {wonReward.name}
              </div>
              <div className="text-xs text-[#FFF4E3]/80 mt-1">
                Value: <span className="font-bold text-[#FFF1CF]">{wonReward.valueDisplay}</span>
              </div>
              <div className="text-[11px] text-[#FF5149] font-mono mt-2 font-bold tracking-wider">
                VOUCHER CODE: {wonReward.voucherCode}
              </div>
            </div>

            <p className="text-xs text-[#FFF4E3]/70 mb-6">
              Your digital voucher has been safely added to your customer wallet. You can view or download your ticket PDF below.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href="/my-rewards"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-xs sm:text-sm hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
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
