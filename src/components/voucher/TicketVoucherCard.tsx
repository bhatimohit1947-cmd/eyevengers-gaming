'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Voucher } from '@/lib/types';
import { generateVoucherPdfBlob } from '@/lib/pdf/voucherPdf';
import { SHOWROOM_INFO } from '@/lib/theme';
import { Download, QrCode, CheckCircle2, Clock, XCircle, MapPin, Sparkles } from 'lucide-react';

interface TicketVoucherCardProps {
  voucher: Voucher;
}

export function TicketVoucherCard({ voucher }: TicketVoucherCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      `${window.location.origin}/staff/redeem?token=${voucher.qrToken}`,
      {
        width: 200,
        margin: 1,
        color: { dark: '#21171A', light: '#FFF4E3' },
      }
    )
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [voucher.qrToken]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateVoucherPdfBlob(voucher);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EYEVENGERS-Voucher-${voucher.voucherCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const isExpired = new Date(voucher.expiryDate) < new Date();

  const getStatusBadge = () => {
    if (voucher.status === 'redeemed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Redeemed</span>
        </span>
      );
    }
    if (voucher.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>Expired</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#681F2B] border border-[#E8C477]/40 text-[#FFF1CF] text-xs font-bold">
        <Sparkles className="w-3.5 h-3.5 text-[#E8C477]" />
        <span>Active & Valid</span>
      </span>
    );
  };

  return (
    <>
      {/* TICKET CONTAINER (Reference 2: Admission Ticket Aesthetics) */}
      <div className="ticket-container relative shadow-2xl transition-transform hover:scale-[1.01]">
        
        {/* Perforated Notches */}
        <div className="ticket-notch-left" />
        <div className="ticket-notch-right" />

        {/* Outer Golden Ticket Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#681F2B] via-[#4A1620] to-[#21171A] border-b-2 border-dashed border-[#E8C477]/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#FFF4E3] tracking-widest text-base sm:text-lg">
              EYE<span className="text-[#E8C477]">VENGERS</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#FF5149] font-bold px-2 py-0.5 rounded bg-[#21171A]/70">
              OFFICIAL VOUCHER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs font-black text-[#21171A] bg-[#E8C477] px-3 py-1 rounded-md shadow-sm">
              {voucher.voucherCode}
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Details */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF5149]">
                {voucher.campaignName}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#FFF4E3] mt-0.5">
                {voucher.rewardName}
              </h3>
              <div className="text-sm font-bold text-[#E8C477] mt-1">
                Reward Benefit: <span className="text-[#FFF1CF]">{voucher.rewardValueDisplay}</span>
              </div>
            </div>

            {/* Beneficiary Meta Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#21171A]/80 border border-[#E8C477]/20 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Beneficiary</span>
                <span className="font-semibold text-[#FFF4E3]">{voucher.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Issue Date</span>
                <span className="font-semibold text-[#FFF4E3]">
                  {new Date(voucher.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Valid Until</span>
                <span className="font-semibold text-[#FF5149]">
                  {new Date(voucher.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Terms and Showroom */}
            <p className="text-[11px] text-[#FFF4E3]/70 leading-relaxed">
              <span className="font-semibold text-[#E8C477]">Terms:</span> {voucher.terms}
            </p>

            <a
              href={SHOWROOM_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#E8C477] hover:text-[#FFD700] hover:underline"
              title="Open Google Maps Store Location"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FF5149]" />
              <span>Redeem at: {SHOWROOM_INFO.addressLine} ↗</span>
            </a>
          </div>

          {/* Right Ticket Stub: QR Code & PDF download */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-[#21171A]/90 border border-[#E8C477]/30 text-center">
            {qrDataUrl ? (
              <div
                onClick={() => setShowQrModal(true)}
                className="cursor-pointer group relative p-2 bg-[#FFF4E3] rounded-lg shadow-md hover:scale-105 transition-transform"
                title="Click to expand QR Code"
              >
                <img src={qrDataUrl} alt="Voucher QR Code" className="w-28 h-28 sm:w-32 sm:h-32" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-white text-xs font-bold">
                  Tap to Zoom
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-lg bg-gray-800 animate-pulse flex items-center justify-center text-xs text-gray-500">
                Generating QR...
              </div>
            )}

            <span className="text-[10px] uppercase tracking-wider text-[#E8C477] font-bold mt-2">
              Scan at Showroom Desk
            </span>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="mt-3 w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#FFF1CF] via-[#E8C477] to-[#D4AF37] text-[#21171A] font-black text-xs hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download Ticket PDF'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* QR ZOOM MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#21171A] border-2 border-[#E8C477] p-8 text-center shadow-2xl">
            <h3 className="text-lg font-black text-[#FFF4E3] mb-1">
              Showroom Redemption QR
            </h3>
            <p className="text-xs text-[#E8C477] mb-6">
              Present this to the EYEVENGERS desk executive
            </p>

            <div className="p-4 bg-[#FFF4E3] rounded-2xl inline-block shadow-xl mb-4">
              <img src={qrDataUrl} alt="Voucher QR Code" className="w-56 h-56 mx-auto" />
            </div>

            <div className="font-mono text-sm font-black text-[#E8C477] mb-6">
              {voucher.voucherCode}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-xl bg-[#681F2B] text-[#FFF4E3] font-bold text-xs border border-[#E8C477]/40 hover:bg-[#852535]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
