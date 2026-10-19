'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToranBorder, DandiyaIcon } from '@/components/ui/FestiveMotifs';
import { Voucher, RedemptionRecord } from '@/lib/types';
import { 
  Scan, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt
} from 'lucide-react';

function RedeemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token');

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [canRedeem, setCanRedeem] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [billReference, setBillReference] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (initialToken) {
      lookupVoucher({ token: initialToken });
    }
  }, [initialToken]);

  const lookupVoucher = async ({ code, token }: { code?: string; token?: string }) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setVoucher(null);
    setLoading(true);

    try {
      const url = token 
        ? `/api/staff/lookup?token=${encodeURIComponent(token)}`
        : `/api/staff/lookup?code=${encodeURIComponent(code || '')}`;

      const res = await fetch(url);
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (res.status === 403) {
          router.push('/auth/login?redirect=/staff/redeem');
          return;
        }
        setErrorMessage(data.error || 'Voucher not found.');
        return;
      }

      setVoucher(data.voucher);
      setIsExpired(data.isExpired);
      setCanRedeem(data.canRedeem);
    } catch {
      setErrorMessage('Server connection error.');
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    lookupVoucher({ code: inputCode.trim() });
  };

  const handleConfirmRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucher) return;

    setRedeeming(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/staff/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherId: voucher.id,
          voucherCode: voucher.voucherCode,
          billReference: billReference.trim() || undefined,
          purchaseAmount: purchaseAmount ? parseFloat(purchaseAmount) : undefined,
          showroomLocation: 'Bhadu Market Showroom, Jodhpur',
        }),
      });

      const data = await res.json();
      setRedeeming(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Redemption failed.');
        return;
      }

      setSuccessMessage(data.message || 'Voucher redeemed successfully!');
      setVoucher(data.voucher);
      setCanRedeem(false);
      setBillReference('');
      setPurchaseAmount('');
    } catch {
      setErrorMessage('Server error during redemption.');
      setRedeeming(false);
    }
  };

  return (
    <>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#681F2B]/70 border border-[#E8C477]/30 text-xs font-bold text-[#FFF1CF] mb-2">
          <Scan className="w-3.5 h-3.5 text-[#E8C477]" />
          <span>Authorized Showroom Desk • Jodhpur</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#FFF4E3] tracking-tight">
          Voucher Verification & Redemption
        </h1>
        <p className="text-xs sm:text-sm text-[#FFF4E3]/80 mt-1">
          Scan customer QR codes or manually enter the voucher code below to validate and apply discounts.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-10">
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Code (e.g. EYE-NAV-A1B2C3)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/40 text-[#FFF4E3] font-mono tracking-wider text-sm placeholder-gray-500 focus:outline-none focus:border-[#E8C477]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-xs sm:text-sm hover:brightness-110 shadow-lg flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Lookup'}</span>
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {voucher && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-[#2A171D] border-2 border-[#E8C477]/50 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8C477]/20 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Voucher Code</span>
              <span className="text-lg font-black font-mono text-[#E8C477]">{voucher.voucherCode}</span>
            </div>
            <div>
              {voucher.status === 'redeemed' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Already Redeemed
                </span>
              ) : isExpired ? (
                <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Expired
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#681F2B] text-[#FFF1CF] border border-[#E8C477]/40 text-xs font-bold flex items-center gap-1">
                  <DandiyaIcon className="w-3.5 h-3.5 text-[#E8C477]" /> Ready to Redeem
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#21171A] border border-[#E8C477]/20">
              <span className="text-gray-400 block text-[10px] uppercase">Customer Name</span>
              <span className="font-bold text-[#FFF4E3] text-sm">{voucher.customerName}</span>
              <span className="text-gray-400 block text-[11px] mt-0.5">{voucher.customerMobile}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#21171A] border border-[#E8C477]/20">
              <span className="text-gray-400 block text-[10px] uppercase">Reward Title</span>
              <span className="font-bold text-[#E8C477] text-sm">{voucher.rewardName}</span>
              <span className="text-[#FFF1CF] font-bold block text-[11px] mt-0.5">Value: {voucher.rewardValueDisplay}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#21171A] border border-[#E8C477]/20 text-xs space-y-1">
            <span className="text-gray-400 block text-[10px] uppercase">Terms & Expiration</span>
            <p className="text-[#FFF4E3]/80">{voucher.terms}</p>
            <div className="text-[11px] text-[#FF5149] pt-1">
              Valid Until: {new Date(voucher.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {voucher.status === 'redeemed' && voucher.redeemedAt && (
            <div className="p-4 rounded-xl bg-[#21171A] border border-emerald-500/30 text-xs space-y-1 text-emerald-300">
              <div className="font-bold">Redemption Details:</div>
              <div>Date & Time: {new Date(voucher.redeemedAt).toLocaleString('en-IN')}</div>
              {voucher.billReference && <div>Invoice/Bill No: {voucher.billReference}</div>}
              {voucher.purchaseAmountPaise && (
                <div>Total Bill Amount: ₹{voucher.purchaseAmountPaise / 100}</div>
              )}
            </div>
          )}

          {canRedeem && (
            <form onSubmit={handleConfirmRedemption} className="pt-4 border-t border-[#E8C477]/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#E8C477] uppercase mb-1">
                    Showroom Bill / Invoice No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-904"
                    value={billReference}
                    onChange={(e) => setBillReference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] text-xs focus:outline-none focus:border-[#E8C477]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#E8C477] uppercase mb-1">
                    Eligible Bill Amount in ₹ (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1499"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] text-xs focus:outline-none focus:border-[#E8C477]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={redeeming}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-sm hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>{redeeming ? 'Processing Redemption...' : 'Confirm Voucher Redemption'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default function StaffRedeemPage() {
  return (
    <div className="min-h-screen bg-[#21171A] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ToranBorder className="mb-4" />
        <Suspense fallback={<div className="p-12 text-center text-gray-400 text-xs">Loading redemption scanner...</div>}>
          <RedeemContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
