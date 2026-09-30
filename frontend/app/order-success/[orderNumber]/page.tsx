'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Package, Truck, ArrowRight, Home,
  Printer, ShieldCheck, MapPin, Phone, CreditCard
} from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { Order } from '@/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      try {
        const o = await api.getOrder(orderNumber);
        setOrder(o);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading order receipt...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            Could not retrieve details for order #{orderNumber}.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery: 3 business days from now
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 3);
  const estDateStr = estDate.toLocaleDateString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Dear <span className="font-bold text-slate-800">{order.customer_name}</span>, your order has been received and is being prepared for dispatch. We will send you SMS tracking updates shortly.
          </p>

          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-6 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Number</span>
              <span className="font-black text-slate-900 text-sm tracking-wider">{order.order_number}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
              <span className="font-bold text-cyan-700">{estDateStr}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Status</span>
              <span className="font-bold text-emerald-600">{order.order_status}</span>
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-600" /> Items in Your Package ({order.items.length})
            </h3>
            <button
              type="button"
              onClick={() => window.print()}
              className="text-xs font-semibold text-slate-500 hover:text-cyan-600 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
          </div>

          {/* Items List */}
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product_image ? (
                      <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product_name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.variant_info ? `&bull; ${item.variant_info}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900 shrink-0">
                  {formatPKR(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatPKR(order.subtotal)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                <span>-{formatPKR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-900">
                {Number(order.shipping_fee) === 0 ? 'FREE' : formatPKR(order.shipping_fee)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Total Amount</span>
              <span className="text-2xl font-black text-slate-900">
                {formatPKR(order.total)}
              </span>
            </div>
          </div>

          {/* Delivery & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Delivery Address
              </h4>
              <p className="text-slate-700 font-semibold">{order.customer_name}</p>
              <p className="text-slate-500 mt-0.5">{order.shipping_address}</p>
              <p className="text-slate-500">{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code || ''}</p>
              <p className="text-slate-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.customer_phone}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-600" /> Payment Information
              </h4>
              <p className="text-slate-700 font-semibold">{order.payment_method}</p>
              <p className="text-slate-500 mt-0.5">
                Payment Status:{' '}
                <span className={`font-bold ${order.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.payment_status}
                </span>
              </p>
              {order.payment_method === 'Cash on Delivery' && (
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Please keep exact cash of <strong className="text-slate-800">{formatPKR(order.total)}</strong> ready for the courier.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/track-order?order=${order.order_number}&phone=${order.customer_phone}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4 text-cyan-400" /> Track This Order
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
