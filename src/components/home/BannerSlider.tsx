'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Banner } from '@/lib/types';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, ArrowRight } from 'lucide-react';
import { MandalaMotif } from '../ui/FestiveMotifs';

interface BannerSliderProps {
  initialBanners?: Banner[];
}

export function BannerSlider({ initialBanners = [] }: BannerSliderProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialBanners.length === 0) {
      fetch('/api/banners')
        .then(res => res.json())
        .then(data => {
          if (data.banners && data.banners.length > 0) {
            setBanners(data.banners);
          }
        })
        .catch(() => {});
    }
  }, [initialBanners]);

  useEffect(() => {
    if (isPlaying && banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#2B0820] via-[#4A0D2E] to-[#2B0820] border-y-2 border-[#FFD700]/40 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
      {/* Decorative Golden Line Overlays with glowing effect */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF1493] to-transparent opacity-80" />

      {/* Floating Glowing Mandala in Background */}
      <div className="absolute -right-12 -top-12 opacity-25 pointer-events-none animate-float">
        <MandalaMotif className="w-80 h-80 text-[#FFD700] drop-shadow-[0_0_25px_rgba(255,215,0,0.4)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[180px]">
          
          {/* Banner Content */}
          <div className="md:col-span-8 space-y-3.5 transition-all duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#681F2B]/80 border border-[#E8C477]/30 text-xs font-bold text-[#E8C477]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5149]" />
              <span>Special Festive Offer • Jodhpur</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FFF4E3] tracking-tight leading-tight">
              {current.title}
            </h2>

            <p className="text-sm sm:text-base text-[#FFF4E3]/80 max-w-2xl leading-relaxed">
              {current.subtitle}
            </p>

            <div className="pt-2">
              <Link
                href={current.ctaLink || '#games'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-bold text-xs sm:text-sm hover:brightness-110 shadow-[0_0_15px_rgba(232,196,119,0.35)] transition-all"
              >
                <span>{current.ctaText || 'Play Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner Badge / Aesthetic Geometric Stamp */}
          <div className="hidden md:flex md:col-span-4 justify-end">
            <div className="relative p-6 rounded-2xl bg-[#2A171D]/90 border border-[#E8C477]/40 shadow-2xl flex flex-col items-center text-center max-w-xs">
              <div className="w-14 h-14 rounded-full bg-[#681F2B] border border-[#E8C477] flex items-center justify-center text-[#E8C477] mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-xs uppercase tracking-widest text-[#E8C477] font-bold mb-1">
                Showroom Special
              </div>
              <div className="text-lg font-black text-[#FFF4E3] leading-snug">
                100% Guaranteed Festive Rewards
              </div>
              <div className="text-[11px] text-[#FFF4E3]/70 mt-1">
                Redeemable at EYEVENGERS (6XX6+X2), Jodhpur
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E8C477]/20 mt-4">
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-[#E8C477]' : 'w-2 bg-[#E8C477]/30 hover:bg-[#E8C477]/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Buttons & Autoplay Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg text-[#FFF4E3]/70 hover:text-[#E8C477] hover:bg-[#681F2B]/40 transition-colors"
              title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-[#FFF4E3] hover:bg-[#681F2B] border border-[#E8C477]/30 transition-colors"
              aria-label="Previous Offer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-[#FFF4E3] hover:bg-[#681F2B] border border-[#E8C477]/30 transition-colors"
              aria-label="Next Offer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
