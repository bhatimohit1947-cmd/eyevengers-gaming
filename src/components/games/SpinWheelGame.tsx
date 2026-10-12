'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Gift, ArrowRight, AlertCircle, RefreshCw, Trophy, FileText } from 'lucide-react';
import Link from 'next/link';
import { MandalaMotif, ToranBorder, DandiyaIcon } from '../ui/FestiveMotifs';

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

  // Always sync latest remaining chances and rewards on client mount
  useEffect(() => {
    fetch('/api/games/status')
      .then(res => res.json())
      .then(data => {
        if (data.rewards?.spinWheel && data.rewards.spinWheel.length > 0) {
          setRewards(data.rewards.spinWheel);
        }
        if (data.plays) {
          setRemainingPlays(data.plays.spinRemaining);
        }
      })
      .catch(() => {});
  }, []);

  // Draw the high-resolution canvas prize wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rewards.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 24;
    const count = rewards.length;
    const arc = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, size, size);

    // Bright, vibrant, festive celebratory palette
    const slicePalette = [
      { bg1: '#FF5722', bg2: '#D84315', text: '#FFFFFF', accent: '#FFE082' }, // Radiant Saffron Orange
      { bg1: '#E91E63', bg2: '#AD1457', text: '#FFFFFF', accent: '#FFF59D' }, // Vivid Rani Pink
      { bg1: '#00B0FF', bg2: '#00838F', text: '#FFFFFF', accent: '#FFD54F' }, // Bright Peacock Blue
      { bg1: '#FFB300', bg2: '#FF8F00', text: '#3E1000', accent: '#FFFDE7' }, // Glowing Festive Gold
      { bg1: '#00C853', bg2: '#1B5E20', text: '#FFFFFF', accent: '#C8E6C9' }, // Emerald Green
      { bg1: '#8E24AA', bg2: '#512DA8', text: '#FFFFFF', accent: '#FFD54F' }, // Royal Purple
      { bg1: '#FF1744', bg2: '#C2185B', text: '#FFFFFF', accent: '#FFE082' }, // Bright Ruby Coral
      { bg1: '#00E5FF', bg2: '#0091EA', text: '#002B49', accent: '#FFFFFF' }, // Electric Cyan
      { bg1: '#F57C00', bg2: '#E65100', text: '#FFFFFF', accent: '#FFF9C4' }, // Deep Amber
      { bg1: '#00E676', bg2: '#00897B', text: '#003314', accent: '#FFFFFF' }, // Vibrant Mint Lime
    ];

    // 1. Draw Each Bright Slice with Radial Gradient
    rewards.forEach((item, i) => {
      const angle = i * arc;
      const theme = slicePalette[i % slicePalette.length];

      // Slice sector
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();

      // Rich radiant radial gradient from center to perimeter
      const grad = ctx.createRadialGradient(center, center, 40, center, center, radius);
      grad.addColorStop(0, '#FFE8A3');
      grad.addColorStop(0.2, theme.bg1);
      grad.addColorStop(1, theme.bg2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp golden divider line with subtle shimmer
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Decorative mini diamond / star near the outer rim of each slice
      const midAngle = angle + arc / 2;
      const markerDist = radius - 14;
      const mx = center + markerDist * Math.cos(midAngle);
      const my = center + markerDist * Math.sin(midAngle);

      ctx.beginPath();
      ctx.arc(mx, my, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFF8E1';
      ctx.shadowColor = '#FFD54F';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();

      // Text label inside slice with maximum contrast & clarity
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(midAngle);

      const label = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;

      ctx.font = '900 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Thick dark outline for 100% crisp readability
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(label, radius - 24, 0);

      // High-contrast radiant fill
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, radius - 24, 0);

      ctx.restore();
    });

    // 2. Inner Golden Border
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 3. Wide Decorative Carnival Golden Rim with LED Light Bulbs
    const rimWidth = 18;
    const rimOuterRadius = radius + rimWidth;

    // Rim metallic ring gradient
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, rimOuterRadius, 0, 2 * Math.PI);
    ctx.arc(center, center, radius, 0, 2 * Math.PI, true);
    const rimGrad = ctx.createRadialGradient(center, center, radius, center, center, rimOuterRadius);
    rimGrad.addColorStop(0, '#B8860B');
    rimGrad.addColorStop(0.3, '#FFD700');
    rimGrad.addColorStop(0.7, '#FFF3A8');
    rimGrad.addColorStop(1, '#8B6508');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Gold outer ridge
    ctx.beginPath();
    ctx.arc(center, center, rimOuterRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFE89E';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glowing Carnival LED Bulbs around the perimeter
    const bulbCount = Math.max(20, count * 3);
    const bulbColors = ['#FFFFFF', '#FFEB3B', '#FF3D00', '#00E676', '#00E5FF', '#FF007F'];

    for (let s = 0; s < bulbCount; s++) {
      const bulbAngle = (s * 2 * Math.PI) / bulbCount;
      const bx = center + (radius + rimWidth / 2) * Math.cos(bulbAngle);
      const by = center + (radius + rimWidth / 2) * Math.sin(bulbAngle);
      const bColor = bulbColors[s % bulbColors.length];

      // Outer bulb glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = bColor;
      ctx.shadowColor = bColor;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Inner bulb highlight
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 4. Center 3D Ornate Golden Hub & Medallion
    ctx.save();
    // Shadow underneath center hub
    ctx.beginPath();
    ctx.arc(center, center, 46, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Outer gold stepped ring
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, 2 * Math.PI);
    const hubGrad1 = ctx.createLinearGradient(center - 44, center - 44, center + 44, center + 44);
    hubGrad1.addColorStop(0, '#FFE8A3');
    hubGrad1.addColorStop(0.5, '#FFD700');
    hubGrad1.addColorStop(1, '#8B6508');
    ctx.fillStyle = hubGrad1;
    ctx.fill();
    ctx.strokeStyle = '#FFFDE7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center jewel circle (Festive Ruby / Crimson)
    ctx.beginPath();
    ctx.arc(center, center, 34, 0, 2 * Math.PI);
    const rubyGrad = ctx.createRadialGradient(center - 8, center - 8, 4, center, center, 34);
    rubyGrad.addColorStop(0, '#FF5252');
    rubyGrad.addColorStop(0.5, '#C2185B');
    rubyGrad.addColorStop(1, '#4A0020');
    ctx.fillStyle = rubyGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sparkle star at center core
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#FFF8E7';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', center, center - 7);
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.fillStyle = '#FFD54F';
    ctx.fillText('WIN', center, center + 7);
    ctx.restore();
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
        if (res.status === 401) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent('/games/spin')}`;
          return;
        }
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
          <DandiyaIcon className="w-3.5 h-3.5 text-[#FF5149]" />
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
        
        {/* Decorative Golden & Ruby Pointer Arrow at Top */}
        <div className="relative z-20 -mb-6 flex flex-col items-center pointer-events-none">
          <div className="relative w-10 h-12 flex items-center justify-center filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]">
            <div
              className="w-9 h-11 bg-gradient-to-b from-[#FFFDE7] via-[#FFD700] to-[#D50000] border-t-2 border-[#FFFFFF]"
              style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
            />
            {/* Sparkling ruby jewel on top of the pointer */}
            <div className="absolute top-1.5 w-3.5 h-3.5 rounded-full bg-[#FF1744] border border-[#FFF9C4] shadow-[0_0_10px_#FF1744]" />
          </div>
        </div>

        {/* Canvas Wheel with Radiant Festive Aura */}
        <div className="relative p-2.5 rounded-full bg-gradient-to-tr from-[#3D1420] via-[#631B2D] to-[#2B0E17] border-4 border-[#FFD700]/80 shadow-[0_0_60px_rgba(255,215,0,0.4),0_0_100px_rgba(255,23,68,0.25)]">
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
                <DandiyaIcon className="w-5 h-5" />
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
          <li>Showroom redemption valid at EYEVENGERS, 137, Jhanwar Rd, Bhadu Market, Jodhpur.</li>
          <li>All vouchers are valid to avail until 25th October 2026 at our showroom.</li>
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
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-xs font-bold">
                <span>Valid to Avail Until: 25 Oct 2026</span>
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
