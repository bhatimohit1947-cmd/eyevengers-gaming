'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { 
  LayoutDashboard, 
  Calendar, 
  Award, 
  Image as ImageIcon, 
  Ticket, 
  Users, 
  UserCheck, 
  History, 
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { SessionUser } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'admin') {
          router.push('/auth/login?redirect=/admin');
        } else {
          setAdminUser(data.user);
        }
      })
      .catch(() => router.push('/auth/login?redirect=/admin'));
  }, [router]);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Campaigns', href: '/admin/campaigns', icon: Calendar },
    { label: 'Rewards & Odds', href: '/admin/rewards', icon: Award },
    { label: 'Homepage Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Vouchers & History', href: '/admin/vouchers', icon: Ticket },
    { label: 'Customer Base', href: '/admin/customers', icon: Users },
    { label: 'Showroom Staff', href: '/admin/staff', icon: UserCheck },
    { label: 'Audit Trail', href: '/admin/audit', icon: History },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#1A1013] text-[#FFF4E3] flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#21171A] border-b border-[#E8C477]/30 p-4 flex items-center justify-between">
        <BrandLogo size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-[#FFF4E3] border border-[#E8C477]/30"
          aria-label="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#21171A] border-r border-[#E8C477]/25 shrink-0 flex flex-col justify-between p-6 z-40`}
      >
        <div className="space-y-6">
          <div className="hidden md:block">
            <BrandLogo size="md" />
            <div className="mt-2 text-[10px] uppercase tracking-widest text-[#E8C477] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E8C477] text-[#21171A] shadow-md'
                      : 'text-[#FFF4E3]/80 hover:bg-[#681F2B]/50 hover:text-[#FFF4E3]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-[#E8C477]/20 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#2A171D] text-xs text-[#E8C477] hover:bg-[#681F2B]/40"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {adminUser && (
            <div className="px-3 py-2 rounded-lg bg-[#2A171D]/60 text-[11px] text-gray-400">
              <div className="font-bold text-[#FFF4E3] truncate">{adminUser.fullName}</div>
              <div className="text-[10px] text-[#E8C477]">{adminUser.mobile}</div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {children}
      </main>

    </div>
  );
}
