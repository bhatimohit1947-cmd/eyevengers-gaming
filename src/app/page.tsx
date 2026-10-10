import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { BannerSlider } from '@/components/home/BannerSlider';
import { HeroSection } from '@/components/home/HeroSection';
import { GameCards } from '@/components/home/GameCards';
import { Footer } from '@/components/layout/Footer';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { SHOWROOM_INFO } from '@/lib/theme';
import { Sparkles, Glasses, Eye, ShieldCheck, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { MandalaMotif, ToranBorder } from '@/components/ui/FestiveMotifs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'EYEVENGERS | Festive Gaming & Optical Rewards • Jodhpur',
  description: 'Celebrate the festive season with EYEVENGERS Jodhpur! Spin the Lucky Wheel and open Mystery Boxes to win exclusive eyewear discounts and free vision consultations.',
  keywords: 'EYEVENGERS, Jodhpur eyewear, optical showroom, festive rewards, lucky spin, mystery box, sunglasses, eye checkup Jodhpur',
};

export default async function HomePage() {
  let session = null;
  let campaign = null;
  let banners: any[] = [];
  let spinRemaining = 1;
  let boxRemaining = 1;

  try {
    session = await getSession();
  } catch (err) {
    console.warn('Session check skipped:', err);
  }

  try {
    campaign = db.getActiveCampaign();
    banners = db.getActiveBanners();
    spinRemaining = campaign ? campaign.spinLimitPerUser : 1;
    boxRemaining = campaign ? campaign.boxLimitPerUser : 1;

    if (session && campaign) {
      const spinCount = db.getUserPlaysCount(session.id, campaign.id, 'spin_wheel');
      const boxCount = db.getUserPlaysCount(session.id, campaign.id, 'mystery_box');
      spinRemaining = Math.max(0, campaign.spinLimitPerUser - spinCount);
      boxRemaining = Math.max(0, campaign.boxLimitPerUser - boxCount);
    }
  } catch (err) {
    console.warn('DB initialization in Server Component handled safely:', err);
  }

  return (
    <div className="min-h-screen bg-festive-radiant flex flex-col text-[#FFFDF7]">
      <Navbar />

      <main className="flex-1">
        
        {/* Top Promotional Carousel */}
        <BannerSlider initialBanners={banners} />

        {/* Hero Section */}
        <HeroSection 
          user={session} 
          campaignName={campaign ? campaign.name : undefined} 
        />

        {/* Interactive Games Cards */}
        <GameCards 
          user={session}
          spinRemaining={spinRemaining}
          boxRemaining={boxRemaining}
          spinEnabled={campaign ? campaign.spinWheelEnabled : true}
          boxEnabled={campaign ? campaign.mysteryBoxesEnabled : true}
        />

        {/* Showroom Experience & Trust Section */}
        <section className="py-16 md:py-24 relative overflow-hidden border-t-2 border-[#FFD700]/30 bg-gradient-to-b from-[#1F0717]/80 via-[#360925]/90 to-[#1F0717]">
          {/* Ambient Lighting Spots */}
          <div className="absolute top-1/2 left-10 w-96 h-96 bg-[#FF1493]/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#FFD700]/15 blur-3xl pointer-events-none rounded-full" />

          <div className="absolute right-0 top-0 opacity-15 pointer-events-none">
            <MandalaMotif className="w-96 h-96 text-[#FFD700]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF1493]/20 via-[#FFD700]/20 to-[#00E5FF]/20 border border-[#FFD700]/50 text-xs font-bold text-[#FFD700] mb-3 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF1493]" />
                <span className="uppercase tracking-wider">Why Choose EYEVENGERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FFFDF7] tracking-tight">
                Premium Eyewear & Advanced Vision Care
              </h2>
              <p className="text-xs sm:text-sm text-[#FFFDF7]/85 mt-3 max-w-xl mx-auto">
                Providing Jodhpur with internationally certified optical lenses, curated designer eyewear, and digital refractive diagnostics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              <div className="p-8 rounded-3xl bg-[#2D0B25]/85 border-2 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                  <Eye className="w-7 h-7 text-[#00E5FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#FFFDF7]">14-Step Precision Eye Testing</h3>
                <p className="text-xs text-[#FFFDF7]/75 leading-relaxed">
                  Automated computer eye examinations conducted by certified senior optometrists for pinpoint accurate prescriptions.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#2D0B25]/85 border-2 border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.4)]">
                  <Glasses className="w-7 h-7 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-bold text-[#FFFDF7]">Curated Festive Eyewear</h3>
                <p className="text-xs text-[#FFFDF7]/75 leading-relaxed">
                  Over 1,500+ trending frames, lightweight titanium glasses, and polarized sunglasses crafted for festive elegance and daily durability.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#2D0B25]/85 border-2 border-[#FF1493]/50 shadow-[0_0_20px_rgba(255,20,147,0.2)] hover:shadow-[0_0_30px_rgba(255,20,147,0.4)] transition-all space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF1493]/20 border border-[#FF1493] flex items-center justify-center text-[#FF1493] shadow-[0_0_12px_rgba(255,20,147,0.4)]">
                  <Award className="w-7 h-7 text-[#FF1493]" />
                </div>
                <h3 className="text-xl font-bold text-[#FFFDF7]">Instant Showroom Redemption</h3>
                <p className="text-xs text-[#FFFDF7]/75 leading-relaxed">
                  Present your winning festive ticket voucher QR code at our Sardarpura counter for immediate billing deductions and complimentary upgrades.
                </p>
              </div>

            </div>

            {/* Showroom Address Highlight Card */}
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#3D0B2B] via-[#520F38] to-[#2D0B25] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#FF1493] animate-bounce" />
                  <span>Flagship Showroom Destination</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#FFFDF7]">
                  {SHOWROOM_INFO.brandName} — Sardarpura, Jodhpur
                </div>
                <p className="text-xs text-[#FFFDF7]/85">
                  {SHOWROOM_INFO.addressLine} • Open 10:30 AM – 9:00 PM (All 7 Days)
                </p>
              </div>

              <a
                href={`tel:${SHOWROOM_INFO.phone}`}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#FFF6BD] via-[#FFD700] to-[#FFA200] text-[#1F0717] font-black text-xs sm:text-sm hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.4)] shrink-0 transition-transform hover:scale-105 active:scale-95"
              >
                Call: {SHOWROOM_INFO.phone}
              </a>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
