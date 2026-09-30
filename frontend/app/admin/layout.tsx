'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, FolderTree, Bookmark,
  ShoppingCart, Users, Boxes, Tag, ArrowLeft, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-semibold">
        Verifying administrator permissions...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 text-center text-white border border-slate-700 space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Admin Privileges Required</h2>
          <p className="text-xs text-slate-400">
            You must be logged in as an administrator to access the Mobixora management suite.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/login?redirect=/admin"
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl bg-slate-700 text-white font-semibold text-xs"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Brands', href: '/admin/brands', icon: Bookmark },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <Logo size="sm" light />
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-[11px] text-cyan-300 font-semibold flex items-center justify-between">
            <span>Admin Console</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom link to user storefront */}
        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
