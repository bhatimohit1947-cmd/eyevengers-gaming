'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { Users, Search, UserCheck, UserX } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = (term?: string) => {
    let url = '/api/admin/customers';
    if (term) url += `?search=${encodeURIComponent(term)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.customers) setCustomers(data.customers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">Customer Accounts</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Registered customers participating in EYEVENGERS festive games.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="max-w-md flex gap-2">
        <input
          type="text"
          placeholder="Search by customer name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#21171A] border border-[#E8C477]/30 text-xs text-[#FFF4E3] placeholder-gray-500 focus:outline-none focus:border-[#E8C477]"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-[#E8C477] text-[#21171A] font-bold text-xs hover:bg-[#FFF1CF] flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </form>

      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Verified Mobile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C477]/10">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#2A171D]/40">
                  <td className="p-3 font-bold text-[#FFF4E3]">{c.fullName}</td>
                  <td className="p-3 font-mono text-[#E8C477]">{c.mobile}</td>
                  <td className="p-3 capitalize">{c.role}</td>
                  <td className="p-3 text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {c.status}
                    </span>
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
