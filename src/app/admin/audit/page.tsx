'use client';

import React, { useState, useEffect } from 'react';
import { AdminAuditLog } from '@/lib/types';
import { History, ShieldCheck } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C477]/20">
        <div>
          <h1 className="text-2xl font-black text-[#FFF4E3]">System & Administrative Audit Trail</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable log of configuration changes, prize pool edits, and staff transactions.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#21171A] border border-[#E8C477]/25">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-xs">Loading audit trail...</div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#2A171D] text-[#E8C477] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin / Executive</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Change Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C477]/10 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#2A171D]/40">
                    <td className="p-3 text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-sans font-bold text-[#FFF4E3]">{log.adminName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#681F2B]/60 text-[#FFF1CF] font-bold border border-[#E8C477]/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-[#E8C477]">{log.targetType} ({log.targetId})</td>
                    <td className="p-3 font-sans text-gray-300 max-w-md truncate">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-xs">
            No audit records registered yet.
          </div>
        )}
      </div>

    </div>
  );
}
