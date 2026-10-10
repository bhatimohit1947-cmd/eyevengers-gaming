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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#E8C477]/20">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="lg" />
            <p className="text-xs sm:text-sm text-[#FFF4E3]/70 leading-relaxed">
              Jodhpur’s premier destination for high-definition optical lenses, designer frames, and advanced computerized eye health diagnostics.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#E8C477] font-semibold">
              <DiyaIcon className="w-4 h-4" />
              <span>Celebrating Rajasthan’s Festive Season</span>
            </div>
          </div>

          {/* Showroom Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477]">
              Visit Showroom
            </h4>
            <div className="space-y-2.5 text-xs text-[#FFF4E3]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5149] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[#FFD700]">{SHOWROOM_INFO.plusCode}</div>
                  <div className="text-[11px] text-[#FFF4E3]/70">{SHOWROOM_INFO.city}, {SHOWROOM_INFO.state}</div>
                  <a 
                    href={SHOWROOM_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] text-[#00E5FF] hover:underline font-semibold mt-0.5"
                  >
                    View on Google Maps ↗
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E8C477] shrink-0" />
                <span>{SHOWROOM_INFO.workingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#E8C477] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href={`tel:${SHOWROOM_INFO.phone}`} className="hover:text-[#E8C477] transition-colors block font-semibold">
                    {SHOWROOM_INFO.phone}
                  </a>
                  <a href={`tel:${SHOWROOM_INFO.secondaryPhone}`} className="hover:text-[#E8C477] transition-colors block text-[11px] text-[#FFF4E3]/75">
                    {SHOWROOM_INFO.secondaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E8C477] shrink-0" />
                <a href={`mailto:${SHOWROOM_INFO.email}`} className="hover:text-[#E8C477] transition-colors">
                  {SHOWROOM_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477]">
              Festive Rewards
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF4E3]/80">
              <li>
                <Link href="/#games" className="hover:text-[#E8C477] transition-colors">
                  Lucky Spin Wheel
                </Link>
              </li>
              <li>
                <Link href="/#games" className="hover:text-[#E8C477] transition-colors">
                  Mystery Gift Boxes
                </Link>
              </li>
              <li>
                <Link href="/my-rewards" className="hover:text-[#E8C477] transition-colors">
                  My Reward Vouchers
                </Link>
              </li>
              <li>
                <Link href="/staff/redeem" className="hover:text-[#E8C477] transition-colors">
                  Showroom Voucher Redemption Desk
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#E8C477] transition-colors">
                  Festive Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#E8C477] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Responsible Play Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E8C477] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E8C477]" />
              <span>Promotional Play Policy</span>
            </h4>
            <p className="text-[11px] text-[#FFF4E3]/70 leading-relaxed">
              This interactive rewards platform is an exclusive promotional customer engagement program by EYEVENGERS Optical Showroom, Jodhpur. 
              No real-money gambling or wagering is involved. All vouchers are valid exclusively for showroom redemption on optical goods and eye examinations.
            </p>
            <div className="p-3 rounded-lg bg-[#2A171D] border border-[#E8C477]/30 text-[10px] text-[#FFF1CF] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#FF5149] shrink-0" />
              <span>Authorized Optical Healthcare Centre, Jodhpur</span>
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
