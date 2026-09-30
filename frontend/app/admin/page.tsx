'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Users, Package, AlertTriangle,
  CheckCircle2, Clock, XCircle, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-500">
        Loading real-time admin telemetry...
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPKR(data.stats.total_revenue),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: data.stats.total_orders,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Registered Customers',
      value: data.stats.total_customers,
      icon: Users,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'Catalog Products',
      value: data.stats.total_products,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Pending Dispatch',
      value: data.stats.pending_orders,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Delivered Orders',
      value: data.stats.delivered_orders,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Low Stock Alerts',
      value: data.stats.low_stock_products,
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Cancelled Orders',
      value: data.stats.cancelled_orders,
      icon: XCircle,
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics directly from the MySQL database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors shadow-xs"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Sales Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Past 7 Days Sales Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Revenue generated in Pakistani Rupees</p>
            </div>
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-4">
            {data.sales_chart.map((day, idx) => {
              const maxRev = Math.max(...data.sales_chart.map((d) => d.revenue), 100000);
              const heightPercent = Math.max(8, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPKR(day.revenue)}
                  </div>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-xl transition-all duration-500 group-hover:from-cyan-500 group-hover:to-blue-400"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Orders by Status
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(data.status_breakdown).map(([status, count]) => {
              const totalOrders = Math.max(data.stats.total_orders, 1);
              const pct = Math.round((count / totalOrders) * 100);

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-900 font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            View all orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.recent_orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-black text-slate-900">{ord.order_number}</td>
                  <td className="py-3.5">
                    <div className="font-bold text-slate-800">{ord.customer_name}</div>
                    <div className="text-[11px] text-slate-400">{ord.customer_phone}</div>
                  </td>
                  <td className="py-3.5 text-slate-600">{ord.shipping_city}, {ord.shipping_province}</td>
                  <td className="py-3.5 font-bold text-slate-700">{ord.items.length} items</td>
                  <td className="py-3.5 font-black text-slate-900">{formatPKR(ord.total)}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.order_status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/track-order?order=${ord.order_number}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg text-[11px] font-bold transition-colors inline-block"
                    >
                      Inspect
                    </Link>
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
