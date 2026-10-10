'use client';

import React, { useState, useEffect } from 'react';
import { Voucher } from '@/lib/types';
import { Search, Ticket, CheckCircle2, Clock, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchVouchers = (status?: string, term?: string) => {
    setLoading(true);
    let url = '/api/admin/vouchers?';
    if (status) url += `status=${encodeURIComponent(status)}&`;
    if (term) url += `search=${encodeURIComponent(term)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.vouchers) setVouchers(data.vouchers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVouchers(statusFilter, search);
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers(statusFilter, search);
  };

  const handleRevoke = async (id: string, code: string) => {
    const reason = prompt(`Reason for revoking voucher ${code}:`);
    if (!reason) return;

    try {
      await fetch(`/api/admin/vouchers/${id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      fetchVouchers(statusFilter, search);
    } catch {}
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Issued Vouchers & Audit Registry</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Track issued tickets, verify QR tokens, and inspect showroom redemptions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by code, customer name, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-xs text-[#FFF4E3] placeholder-gray-500 focus:outline-none focus:border-[#E8C477]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-xs text-[#FFF4E3] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="issued">Issued (Unredeemed)</option>
          <option value="redeemed">Redeemed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Voucher Code</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Reward</th>
                <th className="p-3">Value</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C477]/10">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-[#2A171D]/40">
                  <td className="p-3 font-mono font-bold text-[#E8C477]">{v.voucherCode}</td>
                  <td className="p-3">
                    <div className="font-bold text-[#FFF4E3]">{v.customerName}</div>
                    <div className="text-[10px] text-gray-500">{v.customerMobile}</div>
                  </td>
                  <td className="p-3 text-[#FFF4E3]">{v.rewardName}</td>
                  <td className="p-3 font-semibold text-[#FFF1CF]">{v.rewardValueDisplay}</td>
                  <td className="p-3 text-gray-400">{new Date(v.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3 text-gray-400">{new Date(v.expiryDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">
                    {v.status === 'redeemed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        Redeemed
                      </span>
                    ) : v.status === 'cancelled' ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40 text-[10px]">
                        Cancelled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#681F2B] text-[#FFF1CF] border border-[#E8C477]/40 text-[10px] font-bold">
                        Issued
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {v.status === 'issued' && (
                      <button
                        onClick={() => handleRevoke(v.id, v.voucherCode)}
                        className="px-2.5 py-1 rounded-md bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 text-[10px] font-bold"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
