import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToranBorder } from '@/components/ui/FestiveMotifs';
import { SHOWROOM_INFO } from '@/lib/theme';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#21171A] flex flex-col text-[#FFF4E3]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ToranBorder className="mb-4" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#E8C477] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5149]" />
            <span>Official Showroom Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Festive Promotion Terms & Conditions
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            EYEVENGERS Optical Showroom, Jodhpur • Last updated October 2026
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#2A171D] border border-[#E8C477]/30 space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">1. Eligibility & Scope</h2>
            <p>
              The EYEVENGERS Festive Rewards program is open to residents of India aged 18 and above visiting our optical showroom located at {SHOWROOM_INFO.addressLine}. Participation requires mobile number registration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">2. Game Play Limits</h2>
            <p>
              Unless otherwise configured by administration, each registered customer is eligible for one (1) Lucky Spin Wheel attempt and one (1) Mystery Box opening per festive campaign. Automated scripts, multiple mobile registrations for identical persons, or unauthorized concurrency attempts are strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">3. Voucher Redemption Rules</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vouchers must be presented at the EYEVENGERS Bhadu Market showroom desk via active QR code or verified voucher code.</li>
              <li>Each digital voucher is valid for a single transaction and cannot be split across multiple invoices.</li>
              <li>Vouchers are valid for 14 calendar days from the date of issue unless specified otherwise.</li>
              <li>Discounts are applicable against eligible frames, lenses, and prescription eyewear subject to stated minimum invoice values.</li>
              <li>Vouchers carry no cash value and cannot be exchanged for currency.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">4. Comprehensive Eye Checkup Offers</h2>
            <p>
              Complimentary vision checkups include automated objective refraction and preliminary prescription verification conducted by qualified optometrists. Prior appointment is recommended during peak festive hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">5. Showroom Governance</h2>
            <p>
              EYEVENGERS management reserves the right to verify customer identity and cancel vouchers suspected of fraudulent acquisition. All optical warranties and lens guarantees comply with Indian consumer protection standards.
            </p>
          </section>
        </div>

      </main>

      <Footer />
    </div>
  );
}
