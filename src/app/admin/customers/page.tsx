'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { Users, Search, UserCheck, UserX, RefreshCw } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCustomers = (term?: string) => {
    let url = '/api/admin/customers';
    if (term) url += `?search=${encodeURIComponent(term)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.customers) setCustomers(data.customers);
        setLoading(false);
        setIsRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#FFF4E3]">Customer Accounts</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8C477]/15 border border-[#E8C477]/40 text-xs font-bold text-[#E8C477]">
              {customers.length} registered
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Registered customers participating in EYEVENGERS festive games.
          </p>
        </div>
        <button
          onClick={() => {
            setIsRefreshing(true);
            fetchCustomers(search);
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#681F2B] hover:bg-[#8C1D40] border border-[#E8C477]/40 text-xs font-bold text-[#FFF1CF] transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E8C477] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
        </button>
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
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <RefreshCw className="w-6 h-6 text-[#E8C477] animate-spin" />
            <p className="text-xs">Loading customer records from cloud & local database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
            <Users className="w-10 h-10 text-gray-600 mb-1" />
            <p className="text-sm font-bold text-[#FFF4E3]">No Customers Found</p>
            <p className="text-xs text-gray-400 max-w-sm">
              {search ? 'No registered customers match your search query.' : 'No customer accounts registered yet. New customer registrations will appear here immediately.'}
            </p>
          </div>
        ) : (
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
        )}
      </div>

    </div>
  );
}
