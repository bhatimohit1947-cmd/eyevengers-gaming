'use client';

import React, { useState, useEffect } from 'react';
import { Reward, RewardType, ApplicableGame } from '@/lib/types';
import { Plus, Edit3, Award, AlertCircle, CheckCircle2, Sliders, Boxes } from 'lucide-react';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Form
  const [campaignId, setCampaignId] = useState('cmp-festive-navratri-2026');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardType, setRewardType] = useState<RewardType>('fixed_discount');
  const [monetaryValue, setMonetaryValue] = useState(50); // in Rupees
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [minPurchase, setMinPurchase] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(50);
  const [totalInventory, setTotalInventory] = useState(100);
  const [probabilityPercent, setProbabilityPercent] = useState(10);
  const [applicableGame, setApplicableGame] = useState<ApplicableGame>('both');
  const [terms, setTerms] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState('#E8C477');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRewards = () => {
    fetch('/api/admin/rewards')
      .then(res => res.json())
      .then(data => {
        if (data.rewards) setRewards(data.rewards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const totalProbability = rewards
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.probabilityPercent, 0);

  const openCreateModal = () => {
    setEditingReward(null);
    setName('');
    setDescription('');
    setRewardType('fixed_discount');
    setMonetaryValue(50);
    setDiscountPercentage(0);
    setMinPurchase(499);
    setMaxDiscount(50);
    setTotalInventory(200);
    setProbabilityPercent(10);
    setApplicableGame('both');
    setTerms('Valid at Bhadu Market showroom on purchases above ₹499.');
    setIsActive(true);
    setColor('#E8C477');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (r: Reward) => {
    setEditingReward(r);
    setCampaignId(r.campaignId);
    setName(r.name);
    setDescription(r.description);
    setRewardType(r.rewardType);
    setMonetaryValue(r.monetaryValuePaise / 100);
    setDiscountPercentage(r.discountPercentage);
    setMinPurchase(r.minPurchasePaise / 100);
    setMaxDiscount(r.maxDiscountPaise / 100);
    setTotalInventory(r.totalInventory);
    setProbabilityPercent(r.probabilityPercent);
    setApplicableGame(r.applicableGame);
    setTerms(r.terms);
    setIsActive(r.isActive);
    setColor(r.color || '#E8C477');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      campaignId,
      name,
      description,
      rewardType,
      monetaryValuePaise: Math.round(Number(monetaryValue) * 100),
      discountPercentage: Number(discountPercentage),
      minPurchasePaise: Math.round(Number(minPurchase) * 100),
      maxDiscountPaise: Math.round(Number(maxDiscount) * 100),
      totalInventory: Number(totalInventory),
      probabilityPercent: Number(probabilityPercent),
      applicableGame,
      terms,
      isActive,
      color,
    };

    try {
      const url = editingReward ? `/api/admin/rewards/${editingReward.id}` : '/api/admin/rewards';
      const method = editingReward ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save reward.');
        return;
      }

      setShowModal(false);
      fetchRewards();
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Reward Inventory & Probability Pool</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure reward types, monetary value, stock limits, and mathematical win probabilities.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] shadow-md flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Reward</span>
        </button>
      </div>

      {/* Probability Validation Indicator */}
      <div className="p-4 rounded-xl bg-[#2A171D] border border-[#E8C477]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sliders className="w-5 h-5 text-[#E8C477]" />
          <div>
            <div className="text-xs font-bold text-[#FFF4E3]">Total Active Allocation Probability</div>
            <div className="text-[11px] text-gray-400">Weighted mode normalizes win distribution across available inventory</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black ${Math.abs(totalProbability - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalProbability.toFixed(1)}%
          </span>
          {Math.abs(totalProbability - 100) < 0.1 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
              Target: 100%
            </span>
          )}
        </div>
      </div>

      {/* Rewards Table */}
      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Reward Title</th>
                <th className="p-3">Type & Value</th>
                <th className="p-3">Win Chance</th>
                <th className="p-3">Inventory (Total / Issued / Redeemed)</th>
                <th className="p-3">Game Pool</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C477]/10">
              {rewards.map((r) => {
                const remaining = r.totalInventory - r.issuedCount;
                return (
                  <tr key={r.id} className="hover:bg-[#2A171D]/40">
                    <td className="p-3">
                      <div className="font-bold text-[#FFF4E3]">{r.name}</div>
                      <div className="text-[10px] text-gray-400 max-w-xs truncate">{r.description}</div>
                    </td>
                    <td className="p-3 font-semibold text-[#E8C477]">
                      {r.monetaryValuePaise > 0 
                        ? `₹${r.monetaryValuePaise / 100}` 
                        : (r.discountPercentage > 0 ? `${r.discountPercentage}% OFF` : 'Complimentary')}
                      <div className="text-[10px] text-gray-400 capitalize">{r.rewardType.replace('_', ' ')}</div>
                    </td>
                    <td className="p-3 font-bold text-[#FFF1CF]">
                      {r.probabilityPercent}%
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-200">
                        {r.totalInventory} total
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {r.issuedCount} issued • {r.redeemedCount} redeemed • <span className={remaining > 0 ? 'text-emerald-400' : 'text-red-400'}>{remaining} left</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-[#681F2B]/60 text-[10px] text-[#FFF1CF] font-bold border border-[#E8C477]/20">
                        {r.applicableGame.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px]">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg bg-[#2A171D] hover:bg-[#681F2B] text-[#E8C477] transition-colors"
                        title="Edit Reward"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT REWARD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#2A171D] border border-[#E8C477]/50 p-6 sm:p-8 shadow-2xl my-8">
            <h2 className="text-xl font-black text-[#FFF4E3] mb-4">
              {editingReward ? 'Edit Reward Item' : 'Create New Reward'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Reward Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹150 OFF Premium Lenses"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Reward Type</label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as RewardType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  >
                    <option value="fixed_discount">Fixed Amount Discount</option>
                    <option value="percentage_discount">Percentage Discount</option>
                    <option value="free_product">Free Product (Sunglasses/Frames)</option>
                    <option value="free_service">Free Service (Eye Checkup)</option>
                    <option value="custom">Custom Promotional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Applicable Game</label>
                  <select
                    value={applicableGame}
                    onChange={(e) => setApplicableGame(e.target.value as ApplicableGame)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  >
                    <option value="both">Both (Spin & Boxes)</option>
                    <option value="spin_wheel">Lucky Spin Wheel Only</option>
                    <option value="mystery_box">Mystery Boxes Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Discount in ₹ (Rupees)</label>
                  <input
                    type="number"
                    min={0}
                    value={monetaryValue}
                    onChange={(e) => setMonetaryValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Total Inventory Stock</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={totalInventory}
                    onChange={(e) => setTotalInventory(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    max={100}
                    required
                    value={probabilityPercent}
                    onChange={(e) => setProbabilityPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Terms & Redemption Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#21171A]">
                <label className="flex items-center gap-2 cursor-pointer text-[#FFF4E3]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#E8C477]"
                  />
                  <span className="font-bold">Active in Reward Pool</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C477]/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#21171A] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E8C477] text-[#21171A] font-bold hover:bg-[#FFF1CF]"
                >
                  Save Reward
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
