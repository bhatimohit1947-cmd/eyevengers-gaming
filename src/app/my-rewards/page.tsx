'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TicketVoucherCard } from '@/components/voucher/TicketVoucherCard';
import { ToranBorder, DiyaIcon } from '@/components/ui/FestiveMotifs';
import { Voucher } from '@/lib/types';
import { Gift, Compass, AlertCircle } from 'lucide-react';

export default function MyRewardsPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'issued' | 'redeemed' | 'expired'>('all');

  useEffect(() => {
    fetch('/api/vouchers/my')
      .then(res => {
        if (res.status === 401) {
          router.push('/auth/login?redirect=/my-rewards');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.vouchers) {
          setVouchers(data.vouchers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const filteredVouchers = vouchers.filter(v => {
    const isExpired = new Date(v.expiryDate) < new Date();
    if (filter === 'all') return true;
    if (filter === 'issued') return v.status === 'issued' && !isExpired;
    if (filter === 'redeemed') return v.status === 'redeemed';
    if (filter === 'expired') return v.status === 'expired' || isExpired;
    return true;
  });

  return (
    <div className="min-h-screen bg-festive-radiant flex flex-col text-[#FFFDF7]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ToranBorder className="mb-4" />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#E8C477] mb-2">
            <Gift className="w-3.5 h-3.5 text-[#FF5149]" />
            <span>Digital Rewards Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#FFF4E3] tracking-tight">
            My Eyewear Vouchers
          </h1>
          <p className="text-sm sm:text-base text-[#FFF4E3]/80 mt-2">
            Download your festive admission-ticket vouchers or present the QR code at the EYEVENGERS Bhadu Market showroom counter.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {(['all', 'issued', 'redeemed', 'expired'] as const).map(tab => {
            const labels = {
              all: `All Vouchers (${vouchers.length})`,
              issued: 'Active & Valid',
              redeemed: 'Redeemed',
              expired: 'Expired',
            };
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#E8C477] text-[#21171A] shadow-[0_0_15px_rgba(232,196,119,0.3)]'
                    : 'bg-[#2A171D] border border-[#E8C477]/30 text-[#FFF4E3]/70 hover:text-[#FFF4E3]'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Vouchers List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            Loading your festive rewards...
          </div>
        ) : filteredVouchers.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredVouchers.map(v => (
              <TicketVoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-[#2A171D]/50 border border-[#E8C477]/25 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#681F2B] border border-[#E8C477]/40 flex items-center justify-center text-[#E8C477] mx-auto mb-4">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#FFF4E3] mb-1">
              No Vouchers in this Category
            </h3>
            <p className="text-xs text-[#FFF4E3]/70 max-w-md mx-auto mb-6">
              You haven’t won any vouchers under this filter yet. Try your luck in our festive games!
            </p>
            <Link
              href="/#games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-xs sm:text-sm hover:brightness-110 shadow-lg"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Festive Games</span>
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
