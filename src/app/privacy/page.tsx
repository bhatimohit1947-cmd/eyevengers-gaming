import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToranBorder } from '@/components/ui/FestiveMotifs';
import { SHOWROOM_INFO } from '@/lib/theme';
import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#21171A] flex flex-col text-[#FFF4E3]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ToranBorder className="mb-4" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#E8C477] mb-2">
            <Lock className="w-3.5 h-3.5 text-[#FF5149]" />
            <span>Customer Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Privacy & Data Security Policy
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            EYEVENGERS Optical Showroom, Jodhpur • India
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#2A171D] border border-[#E8C477]/30 space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">1. Minimal Data Collection</h2>
            <p>
              EYEVENGERS collects only essential information required to verify customer identity and deliver reward vouchers: customer full name and 10-digit mobile number. We do not sell, rent, or trade customer contact details to third-party telemarketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">2. Password Security</h2>
            <p>
              Customer passwords are encrypted using one-way cryptographic hashing (bcrypt) before storage in our database. Passwords are never stored in plaintext and cannot be read by showroom executives or administrators.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">3. Showroom Redemption Records</h2>
            <p>
              When a voucher is redeemed at our Sardarpura showroom, we record the redemption timestamp, staff desk identifier, and billing invoice reference to prevent duplicate voucher usage and verify legitimate reward fulfillment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#E8C477]">4. Contact & Inquiries</h2>
            <p>
              For privacy inquiries or request for account record deletion, customers may contact our showroom privacy desk at <a href={`mailto:${SHOWROOM_INFO.email}`} className="text-[#E8C477] underline">{SHOWROOM_INFO.email}</a> or call {SHOWROOM_INFO.phone}.
            </p>
          </section>
        </div>

      </main>

      <Footer />
    </div>
  );
}
