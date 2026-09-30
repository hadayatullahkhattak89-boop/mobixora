'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, X, Check, Calendar } from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('2000');
  const [maximumDiscount, setMaximumDiscount] = useState('5000');
  const [usageLimit, setUsageLimit] = useState('200');
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.getCoupons();
      setCoupons(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        minimum_order: parseFloat(minimumOrder) || 0,
        maximum_discount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usage_limit: parseInt(usageLimit) || 100,
        is_active: true,
      });
      setShowModal(false);
      setCode('');
      setDiscountValue('');
      await loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Error creating coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Promotional Coupons &amp; Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create percentage discounts or fixed PKR cash deductions for customer campaigns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-cyan-600 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active coupons created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Benefit</th>
                  <th className="py-3.5 px-4">Min. Spend</th>
                  <th className="py-3.5 px-4">Max. Cap</th>
                  <th className="py-3.5 px-4">Usage Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-mono font-black text-slate-900 text-sm tracking-wider">
                        <Tag className="w-3.5 h-3.5 text-cyan-600" /> {c.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">
                        {c.discount_type === 'percentage'
                          ? `${c.discount_value}% Discount`
                          : `${formatPKR(c.discount_value)} Flat Off`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatPKR(c.minimum_order)}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.maximum_discount ? formatPKR(c.maximum_discount) : 'No cap'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {c.times_used} / {c.usage_limit} used
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create New Coupon Code</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. FLASH25"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 uppercase font-black tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {discountType === 'percentage' ? 'Percentage % *' : 'Amount (Rs.) *'}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    placeholder={discountType === 'percentage' ? '15' : '1000'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min. Order (PKR)</label>
                  <input
                    type="number"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    placeholder="2000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Cap (PKR, opt)</label>
                  <input
                    type="number"
                    value={maximumDiscount}
                    onChange={(e) => setMaximumDiscount(e.target.value)}
                    placeholder="5000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="200"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md mt-2"
              >
                {saving ? 'Creating...' : 'Issue Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
