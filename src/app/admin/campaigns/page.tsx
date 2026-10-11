'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, FestivalTheme } from '@/lib/types';
import { Plus, Edit3, Check, X, Calendar, AlertCircle } from 'lucide-react';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<FestivalTheme>('navratri');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [spinWheelEnabled, setSpinWheelEnabled] = useState(true);
  const [mysteryBoxesEnabled, setMysteryBoxesEnabled] = useState(true);
  const [spinLimit, setSpinLimit] = useState(1);
  const [boxLimit, setBoxLimit] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCampaigns = () => {
    fetch('/api/admin/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.campaigns) setCampaigns(data.campaigns);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setSlug(`festive-${Date.now().toString().slice(-4)}`);
    setDescription('');
    setTheme('navratri');
    const now = new Date();
    setStartDate(now.toISOString().slice(0, 16));
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setEndDate(nextMonth.toISOString().slice(0, 16));
    setIsActive(true);
    setSpinWheelEnabled(true);
    setMysteryBoxesEnabled(true);
    setSpinLimit(1);
    setBoxLimit(1);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (c: Campaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description);
    setTheme(c.theme);
    setStartDate(c.startDate.slice(0, 16));
    setEndDate(c.endDate.slice(0, 16));
    setIsActive(c.isActive);
    setSpinWheelEnabled(c.spinWheelEnabled);
    setMysteryBoxesEnabled(c.mysteryBoxesEnabled);
    setSpinLimit(c.spinLimitPerUser);
    setBoxLimit(c.boxLimitPerUser);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      name,
      slug,
      description,
      theme,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      spinWheelEnabled,
      mysteryBoxesEnabled,
      spinLimitPerUser: Number(spinLimit),
      boxLimitPerUser: Number(boxLimit),
    };

    try {
      const url = editingCampaign ? `/api/admin/campaigns/${editingCampaign.id}` : '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save campaign.');
        return;
      }

      setShowModal(false);
      fetchCampaigns();
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Festive Campaign Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Create, schedule, and configure festival gaming rules and limits.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Campaign Name</th>
                <th className="p-3">Theme</th>
                <th className="p-3">Status</th>
                <th className="p-3">Games Active</th>
                <th className="p-3">Limits (Spin / Box)</th>
                <th className="p-3">Schedule</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C477]/10">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A171D]/40">
                  <td className="p-3">
                    <div className="font-bold text-[#FFF4E3]">{c.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{c.slug}</div>
                  </td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-[#681F2B]/60 border border-[#E8C477]/30 text-[10px] text-[#FFF1CF] font-bold">
                      {c.theme}
                    </span>
                  </td>
                  <td className="p-3">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px]">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.spinWheelEnabled ? 'bg-[#E8C477]/20 text-[#E8C477]' : 'bg-gray-800 text-gray-500 line-through'}`}>
                        Spin Wheel
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.mysteryBoxesEnabled ? 'bg-[#FF5149]/20 text-[#FF5149]' : 'bg-gray-800 text-gray-500 line-through'}`}>
                        Mystery Boxes
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-[#FFF4E3]">
                    {c.spinLimitPerUser} / {c.boxLimitPerUser} per user
                  </td>
                  <td className="p-3 text-[11px] text-gray-400">
                    <div>{new Date(c.startDate).toLocaleDateString('en-IN')}</div>
                    <div>to {new Date(c.endDate).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg bg-[#2A171D] hover:bg-[#681F2B] text-[#E8C477] transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#2A171D] border border-[#E8C477]/50 p-6 sm:p-8 shadow-2xl my-8">
            <h2 className="text-xl font-black text-[#FFF4E3] mb-4">
              {editingCampaign ? 'Edit Festive Campaign' : 'Create New Campaign'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Festival Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as FestivalTheme)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  >
                    <option value="navratri">Navratri (Maroon / Gold)</option>
                    <option value="diwali">Diwali (Royal Violet / Gold)</option>
                    <option value="holi">Holi (Gulal / Coral)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Promotional Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Spin Limit / User</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={spinLimit}
                    onChange={(e) => setSpinLimit(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Box Limit / User</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={boxLimit}
                    onChange={(e) => setBoxLimit(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 rounded-lg bg-[#21171A] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#FFF4E3]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#E8C477]"
                  />
                  <span className="font-bold">Campaign Is Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#FFF4E3]">
                  <input
                    type="checkbox"
                    checked={spinWheelEnabled}
                    onChange={(e) => setSpinWheelEnabled(e.target.checked)}
                    className="rounded text-[#E8C477]"
                  />
                  <span>Enable Lucky Spin Wheel Game</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#FFF4E3]">
                  <input
                    type="checkbox"
                    checked={mysteryBoxesEnabled}
                    onChange={(e) => setMysteryBoxesEnabled(e.target.checked)}
                    className="rounded text-[#E8C477]"
                  />
                  <span>Enable Mystery Boxes Game</span>
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
                  Save Campaign
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
