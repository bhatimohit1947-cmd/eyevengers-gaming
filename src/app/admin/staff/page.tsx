'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { Plus, UserCheck, Shield, AlertCircle } from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStaff = () => {
    fetch('/api/admin/staff')
      .then(res => res.json())
      .then(data => {
        if (data.staff) setStaffList(data.staff);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobile, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create staff member.');
        return;
      }

      setShowModal(false);
      setFullName('');
      setMobile('');
      setPassword('');
      fetchStaff();
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Showroom Staff Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Authorize showroom desk personnel to redeem vouchers via camera or manual entry.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErrorMsg(null); }}
          className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#2A171D] border border-[#E8C477]/30 text-xs text-gray-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#E8C477] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#FFF4E3]">Role Security Enforcement:</span> Staff accounts are restricted exclusively to the Showroom Desk at <code className="text-[#E8C477]">/staff/redeem</code>. Staff cannot inspect customer passwords, alter prize probabilities, or modify campaign rules.
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Login Mobile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Showroom Assignment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C477]/10">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-[#2A171D]/40">
                  <td className="p-3 font-bold text-[#FFF4E3]">{s.fullName}</td>
                  <td className="p-3 font-mono text-[#E8C477]">{s.mobile}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#681F2B]/60 text-[#FFF1CF] text-[10px] font-bold">
                      Showroom Staff
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">Sardarpura Showroom, Jodhpur</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#2A171D] border border-[#E8C477]/50 p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-black text-[#FFF4E3] mb-4">
              Create Showroom Staff Account
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Joshi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#E8C477] uppercase mb-1">Temporary Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#21171A] border border-[#E8C477]/30 text-[#FFF4E3]"
                />
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
                  className="px-5 py-2.5 rounded-lg bg-[#E8C477] text-[#21171A] font-bold hover:bg-[#FFF1CF]"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
