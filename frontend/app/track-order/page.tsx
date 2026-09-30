'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Truck, Search, Package, CheckCircle2, Clock, AlertCircle,
  MapPin, Phone, Calendar, ArrowRight
} from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { Order } from '@/types';

const ORDER_STEPS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [phoneQuery, setPhoneQuery] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (ordNum: string) => {
    if (!ordNum.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getOrder(ordNum.trim().toUpperCase());
      setOrder(res);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify the order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const getStepIndex = (status: string) => {
    const idx = ORDER_STEPS.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'Cancelled' || order?.order_status === 'Returned';

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Enter your Mobixora Order Number (e.g. <span className="font-semibold text-slate-800">ORD-2026-000001</span>) to see real-time dispatch and delivery progress.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
                placeholder="Enter Order Number (e.g. ORD-2026-000001)"
                required
                className="w-full text-xs sm:text-sm p-3.5 pl-10 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-bold uppercase tracking-wider"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-8 rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
                <h2 className="text-xl font-black text-slate-900 tracking-wider">{order.order_number}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Status</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-800'
                      : order.order_status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}
                >
                  {order.order_status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {!isCancelled ? (
              <div className="py-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
                  Shipment Progress Timeline
                </h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                  <div
                    className="hidden sm:block absolute top-1/2 left-0 h-1 bg-cyan-500 -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Steps */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                              isCurrent
                                ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/20 shadow-md'
                                : isCompleted
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs ${
                              isCurrent
                                ? 'font-bold text-cyan-700'
                                : isCompleted
                                ? 'font-semibold text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                This order was marked as <strong>{order.order_status}</strong>. If you have questions regarding refund or re-delivery, contact our customer helpline.
              </div>
            )}

            {/* Recipient & Shipment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Destination
                </span>
                <p className="font-semibold text-slate-800">{order.customer_name}</p>
                <p className="text-slate-500">{order.shipping_address}</p>
                <p className="text-slate-500">{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code || ''}</p>
                <p className="text-slate-500">{order.customer_phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-600" /> Payment &amp; Courier
                </span>
                <p className="text-slate-700">Payment: <strong>{order.payment_method}</strong> ({order.payment_status})</p>
                <p className="text-slate-700">Total: <strong>{formatPKR(order.total)}</strong></p>
                <p className="text-slate-500">Shipping: TCS / Leopards Express Nationwide</p>
              </div>
            </div>

            {/* Items in this order */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Items in Shipment ({order.items.length})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity} {item.variant_info ? `&bull; ${item.variant_info}` : ''}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatPKR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
