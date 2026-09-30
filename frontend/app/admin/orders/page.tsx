'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Eye, Printer, CheckCircle2, Clock,
  Truck, AlertCircle, X, ShieldCheck
} from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { Order } from '@/types';

const STATUS_OPTIONS = [
  'All',
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders(
        statusFilter === 'All' ? undefined : statusFilter,
        search.trim() || undefined
      );
      setOrders(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, { order_status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: number, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, { payment_status: newPaymentStatus });
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Fulfillment Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch shipments, update milestones, print invoices, and monitor revenue in real-time.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No orders found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">City / Province</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 tracking-wider">
                      {ord.order_number}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {new Date(ord.created_at).toLocaleDateString('en-PK')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {ord.shipping_city}, {ord.shipping_province}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{ord.payment_method}</div>
                      <select
                        value={ord.payment_status}
                        onChange={(e) => handlePaymentStatusChange(ord.id, e.target.value)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-transparent hover:border-slate-200 outline-hidden ${
                          ord.payment_status === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatPKR(ord.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={ord.order_status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 py-1.5 px-2 outline-hidden focus:border-cyan-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                          title="Invoice Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-600">Mobixora Invoice</span>
                <h3 className="text-xl font-black text-slate-900">{selectedOrder.order_number}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Customer &amp; Shipping</span>
                <p>{selectedOrder.customer_name}</p>
                <p className="text-slate-500">{selectedOrder.customer_phone}</p>
                <p className="text-slate-500">{selectedOrder.customer_email}</p>
                <p className="text-slate-500">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_province}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Payment &amp; Status</span>
                <p>Method: <strong>{selectedOrder.payment_method}</strong></p>
                <p>Payment: <strong>{selectedOrder.payment_status}</strong></p>
                <p>Status: <strong>{selectedOrder.order_status}</strong></p>
                {selectedOrder.coupon_code && <p className="text-emerald-600">Coupon: {selectedOrder.coupon_code}</p>}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 text-xs">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{it.product_name}</span>
                    <span className="text-slate-400 block text-[11px]">Qty: {it.quantity} {it.variant_info ? `(${it.variant_info})` : ''}</span>
                  </div>
                  <span className="font-black text-slate-900">{formatPKR(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-slate-200 text-xs space-y-1 text-right">
              <p>Subtotal: <strong>{formatPKR(selectedOrder.subtotal)}</strong></p>
              {Number(selectedOrder.discount) > 0 && <p className="text-emerald-600">Discount: -{formatPKR(selectedOrder.discount)}</p>}
              <p>Shipping: <strong>{Number(selectedOrder.shipping_fee) === 0 ? 'FREE' : formatPKR(selectedOrder.shipping_fee)}</strong></p>
              <p className="text-base font-black text-slate-900 pt-2 border-t border-slate-100">Total: {formatPKR(selectedOrder.total)}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
