'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Dna, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  TrendingUp, 
  IndianRupee,
  Database,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  RefreshCw
} from 'lucide-react';
import { DandiyaIcon } from '@/components/ui/FestiveMotifs';
import { RedemptionRecord, Campaign } from '@/lib/types';

interface MetricsData {
  totalCustomers: number;
  activeCampaigns: number;
  totalPlays: number;
  spinPlays: number;
  boxPlays: number;
  vouchersIssued: number;
  vouchersRedeemed: number;
  vouchersExpired: number;
  remainingInventory: number;
  redemptionRate: number;
  estimatedCostPaise: number;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<RedemptionRecord[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.recentRedemptions) setRecentRedemptions(data.recentRedemptions);
      if (data.activeCampaign) setActiveCampaign(data.activeCampaign);
    } catch {} finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm">
        Loading admin metrics...
      </div>
    );
  }

  const statCards = [
    { label: 'Registered Customers', value: metrics.totalCustomers, icon: Users, color: 'text-[#FFF4E3]', bg: 'bg-[#2A171D]' },
    { label: 'Total Game Plays', value: metrics.totalPlays, icon: Gamepad2, color: 'text-[#E8C477]', bg: 'bg-[#2A171D]', sub: `Spin: ${metrics.spinPlays} | Boxes: ${metrics.boxPlays}` },
    { label: 'Vouchers Issued', value: metrics.vouchersIssued, icon: Ticket, color: 'text-[#FFF1CF]', bg: 'bg-[#2A171D]' },
    { label: 'Vouchers Redeemed', value: metrics.vouchersRedeemed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-[#2A171D]' },
    { label: 'Redemption Rate', value: `${metrics.redemptionRate}%`, icon: TrendingUp, color: 'text-[#FF5149]', bg: 'bg-[#2A171D]' },
    { label: 'Remaining Reward Stock', value: metrics.remainingInventory, icon: Boxes, color: 'text-[#E8C477]', bg: 'bg-[#2A171D]' },
    { label: 'Promotional Reward Value', value: `₹${(metrics.estimatedCostPaise / 100).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-amber-300', bg: 'bg-[#2A171D]', sub: 'Redeemed so far' },
    { label: 'Expired Vouchers', value: metrics.vouchersExpired, icon: Clock, color: 'text-gray-400', bg: 'bg-[#2A171D]' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title & Database Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFF4E3]">
            Festive Analytics & Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time customer engagement and voucher redemption metrics for EYEVENGERS Jodhpur.
          </p>
        </div>

        {/* Database Mode Chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadData();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#681F2B] hover:bg-[#8C1D40] border border-[#E8C477]/40 text-xs font-bold text-[#FFF1CF] transition-colors shadow-sm disabled:opacity-50"
            title="Refresh metrics live"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E8C477] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/30 text-xs">
            <Database className="w-4 h-4 text-[#E8C477]" />
            <span className="text-gray-300">Storage:</span>
            <span className="font-bold text-[#FFF1CF]">ACID Storage Engine Ready</span>
          </div>
        </div>
      </div>

      {/* Active Campaign Status Widget */}
      {activeCampaign ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#681F2B] via-[#4A1620] to-[#21171A] border border-[#E8C477]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8C477] uppercase tracking-wider">
              <DandiyaIcon className="w-3.5 h-3.5 text-[#FF5149]" />
              <span>Currently Active Campaign</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#FFF4E3]">
              {activeCampaign.name}
            </h2>
            <p className="text-xs text-[#FFF4E3]/80">
              Valid: {new Date(activeCampaign.startDate).toLocaleDateString('en-IN')} - {new Date(activeCampaign.endDate).toLocaleDateString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/rewards"
              className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] transition-colors"
            >
              Configure Rewards & Odds
            </Link>
            <Link
              href="/admin/campaigns"
              className="px-4 py-2.5 rounded-xl bg-[#2A171D] border border-[#E8C477]/40 text-[#FFF4E3] font-bold text-xs hover:bg-[#681F2B]/40"
            >
              Edit Campaign
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#2A171D] border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <span>No active campaign scheduled. Customers currently cannot play.</span>
          <Link href="/admin/campaigns" className="font-bold underline text-[#E8C477]">
            Create or Activate Campaign
          </Link>
        </div>
      )}

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl ${card.bg} border border-[#E8C477]/25 shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">{card.label}</span>
                <div className="p-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                {card.sub && (
                  <div className="text-[10px] text-gray-400 mt-1">{card.sub}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT REDEMPTIONS TABLE */}
      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#FFF4E3] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recent Showroom Redemptions</span>
          </h3>
          <Link href="/admin/vouchers" className="text-xs text-[#E8C477] hover:underline flex items-center gap-1">
            <span>View All Vouchers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRedemptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Voucher Code</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Reward Title</th>
                  <th className="p-3">Staff Desk</th>
                  <th className="p-3">Invoice No.</th>
                  <th className="p-3">Bill Amount</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C477]/10">
                {recentRedemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-[#2A171D]/40">
                    <td className="p-3 font-mono font-bold text-[#E8C477]">{r.voucherCode}</td>
                    <td className="p-3 text-[#FFF4E3]">{r.customerName}</td>
                    <td className="p-3">{r.rewardName}</td>
                    <td className="p-3 text-gray-400">{r.staffName}</td>
                    <td className="p-3 text-gray-400">{r.billReference || 'N/A'}</td>
                    <td className="p-3 font-semibold text-emerald-400">
                      {r.purchaseAmountPaise ? `₹${r.purchaseAmountPaise / 100}` : '-'}
                    </td>
                    <td className="p-3 text-gray-400">{new Date(r.redeemedAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-xs">
            No showroom redemptions recorded yet.
          </div>
        )}
      </div>

    </div>
  );
}
