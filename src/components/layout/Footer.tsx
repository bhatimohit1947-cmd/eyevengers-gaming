import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '../ui/BrandLogo';
import { SHOWROOM_INFO } from '@/lib/theme';
import { MapPin, Phone, Mail, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ToranBorder, DiyaIcon } from '../ui/FestiveMotifs';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#1F0717] to-[#12030E] text-[#FFFDF7] border-t-2 border-[#FFD700]/40 relative pt-12 pb-8">
      <ToranBorder className="mb-8" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[#E8C477]/20">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" />
            <p className="text-xs sm:text-sm text-[#FFF4E3]/75 leading-relaxed max-w-sm">
              Jodhpur’s premier destination for high-definition optical lenses, designer frames, and advanced computerized eye health diagnostics.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs text-[#E8C477] font-semibold">
              <DiyaIcon className="w-3.5 h-3.5" />
              <span>Celebrating Rajasthan’s Festive Season</span>
            </div>
          </div>

          {/* Showroom Location / Store Locator */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Visit Showroom</span>
            </h4>
            
            <a 
              href={SHOWROOM_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google Maps Store Locator"
              className="group block p-3 rounded-xl bg-[#2A0921]/90 border border-[#00E676]/50 hover:border-[#00E676] hover:bg-[#00E676]/10 transition-all shadow-[0_0_15px_rgba(0,230,118,0.15)] cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-black text-[#00E676]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00E676] group-hover:animate-bounce" />
                  Store Locator
                </span>
                <span className="text-[10px] font-bold group-hover:translate-x-0.5 transition-transform bg-[#00E676]/20 px-1.5 py-0.5 rounded">
                  Maps ↗
                </span>
              </div>
              <div className="mt-1.5 font-bold text-[#FFD700] text-xs">{SHOWROOM_INFO.plusCode}</div>
              <div className="text-[11px] text-[#FFF4E3]/75">{SHOWROOM_INFO.city}, {SHOWROOM_INFO.state}</div>
            </a>

            <div className="space-y-2 text-xs text-[#FFF4E3]/85 pt-1">
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[#E8C477] shrink-0" />
                <span className="text-[11px]">{SHOWROOM_INFO.workingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#E8C477] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href={`tel:${SHOWROOM_INFO.phone}`} className="hover:text-[#FFD700] transition-colors block font-bold text-[#FFFDF7] text-xs">
                    {SHOWROOM_INFO.phone}
                  </a>
                  <a href={`tel:${SHOWROOM_INFO.secondaryPhone}`} className="hover:text-[#FFD700] transition-colors block text-[11px] text-[#FFF4E3]/70">
                    {SHOWROOM_INFO.secondaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#E8C477] shrink-0" />
                <a href={`mailto:${SHOWROOM_INFO.email}`} className="hover:text-[#FFD700] transition-colors text-[11px]">
                  {SHOWROOM_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477]">
              Festive Rewards
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF4E3]/80">
              <li>
                <Link href="/#games" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> Lucky Spin Wheel
                </Link>
              </li>
              <li>
                <Link href="/#games" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> Mystery Gift Boxes
                </Link>
              </li>
              <li>
                <Link href="/my-rewards" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> My Reward Vouchers
                </Link>
              </li>
              <li>
                <Link href="/staff/redeem" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> Showroom Desk
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                  <span className="text-[#FFD700]">›</span> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Responsible Play Notice */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E8C477]" />
              <span>Promotional Play Policy</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-[#2A121E]/80 border border-[#E8C477]/25 space-y-3">
              <p className="text-[11px] text-[#FFF4E3]/75 leading-relaxed">
                This interactive rewards platform is an exclusive promotional customer engagement program by EYEVENGERS Optical Showroom, Jodhpur. No real-money gambling or wagering is involved. All vouchers are valid exclusively for showroom redemption.
              </p>
              <div className="pt-2.5 border-t border-[#E8C477]/15 flex items-center gap-2 text-[10px] text-[#FFD700] font-semibold">
                <HeartHandshake className="w-4 h-4 text-[#FF5149] shrink-0" />
                <span>Authorized Optical Healthcare Centre, Jodhpur</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF4E3]/60 gap-4">
          <p>© 2026 EYEVENGERS. All rights reserved. Jodhpur, Rajasthan, India.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#E8C477] transition-colors">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:text-[#E8C477] transition-colors">
              Privacy Notice
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
