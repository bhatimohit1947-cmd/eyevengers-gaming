'use client';

import React, { useState, useEffect } from 'react';
import { Banner } from '@/lib/types';
import { Plus, Edit3, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/banners/navratri-spin.svg');
  const [ctaText, setCtaText] = useState('Explore Games');
  const [ctaLink, setCtaLink] = useState('#games');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBanners = () => {
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (data.banners) setBanners(data.banners);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('/banners/navratri-spin.svg');
    setCtaText('Explore Games');
    setCtaLink('#games');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setImageUrl(b.imageUrl);
    setCtaText(b.ctaText);
    setCtaLink(b.ctaLink);
    setDisplayOrder(b.displayOrder);
    setIsActive(b.isActive);
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const payload = {
      title,
      subtitle,
      imageUrl,
      ctaText,
      ctaLink,
      displayOrder: Number(displayOrder),
      isActive,
      startDate: now.toISOString(),
      endDate: future.toISOString(),
      theme: 'navratri',
    };

    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save banner.');
        return;
      }

      setShowModal(false);
      fetchBanners();
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Homepage Promotional Banners</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage the hero offer slider, promotional headings, and call-to-actions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl bg-[#21171A] border border-[#E8C477]/30 p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#E8C477] font-bold px-2 py-0.5 rounded bg-[#2A171D] border border-[#E8C477]/20">
                  Order #{b.displayOrder}
                </span>
                {b.isActive ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px]">
                    Inactive
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-[#FFF4E3] mb-1">{b.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{b.subtitle}</p>
            </div>

            <div className="pt-3 border-t border-[#E8C477]/15 flex items-center justify-between text-xs">
              <span className="text-[#E8C477] font-bold">CTA: {b.ctaText}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 rounded-lg bg-[#2A171D] hover:bg-[#681F2B] text-[#E8C477]"
                  title="Edit Banner"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 rounded-lg bg-[#2A171D] hover:bg-red-950 text-red-400"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#2A171D] border border-[#E8C477]/50 p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-black text-[#FFF4E3] mb-4">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Banner Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E8C477] uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#21171A]">
                <label className="flex items-center gap-2 cursor-pointer text-[#FFF4E3]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#E8C477]"
                  />
                  <span className="font-bold">Active On Homepage</span>
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
                  Save Banner
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
