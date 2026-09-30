'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2, ShoppingBag, ArrowRight, ArrowLeft,
  Tag, CheckCircle2, ShieldCheck, Truck, AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPKR, api } from '@/services/api';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart, subtotal, loading } = useCart();
  const { toggleWishlist } = useWishlist();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const items = cart?.items || [];
  const shippingFee = subtotal >= 3000 || subtotal === 0 ? 0 : 250;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount_amount: Number(res.discount_amount),
          message: res.message,
        });
        setCouponCode('');
      } else {
        setCouponError(res.message);
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSaveForLater = async (itemId: number, productId: number) => {
    await toggleWishlist(productId);
    await removeItem(itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-slate-500 mb-8 leading-relaxed">
            Looks like you haven&apos;t added any smartphones or tech accessories to your cart yet. Explore our catalog for the latest deals.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              You have <span className="font-bold text-slate-900">{items.length}</span> unique items in your cart
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {items.map((item) => {
                const img = item.product.images[0]?.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
                return (
                  <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Thumb */}
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0"
                    >
                      <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block mb-0.5">
                        {item.product.brand?.name || 'Mobixora'}
                      </span>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>

                      {item.variant && (
                        <p className="text-xs text-slate-500 mt-1">
                          Option: <span className="font-semibold text-slate-700">{item.variant.variant_name} ({item.variant.variant_value})</span>
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveForLater(item.id, item.product_id)}
                          className="text-slate-400 hover:text-cyan-600 font-semibold"
                        >
                          Save for Later
                        </button>
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
                      <span className="text-base font-black text-slate-900">
                        {formatPKR(item.item_total)}
                      </span>

                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              {/* Coupon Form */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Have a Discount Coupon?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 px-3 py-2 uppercase bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Coupon &apos;{appliedCoupon.code}&apos; Applied!
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-rose-600 text-[11px] font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {couponError}
                  </p>
                )}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPKR(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee (Nationwide)</span>
                  <span className="font-bold text-slate-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 uppercase text-[11px]">Free</span>
                    ) : (
                      formatPKR(shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Estimated Total</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatPKR(total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => router.push(appliedCoupon ? `/checkout?coupon=${appliedCoupon.code}` : '/checkout')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 text-[11px] text-slate-400 text-center">
                <p className="flex items-center justify-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cash on Delivery Available
                </p>
                <p>7-Day Money Back Checking Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
