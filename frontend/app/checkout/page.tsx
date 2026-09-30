'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, Truck, CreditCard, Banknote, Building2,
  ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, formatPKR } from '@/services/api';

const PAKISTANI_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const POPULAR_CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad',
  'Peshawar', 'Multan', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Mirpur (AJK)', 'Muzaffarabad', 'Gilgit', 'Skardu'
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get('coupon') || '';

  const { cart, subtotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [province, setProvince] = useState('Islamabad Capital Territory');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping & Payment Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Bank Transfer' | 'Online Payment'>('Cash on Delivery');

  // Coupon state
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Populate from user if logged in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Validate initial coupon if passed via query
  useEffect(() => {
    if (initialCoupon && subtotal > 0) {
      api.validateCoupon(initialCoupon, subtotal)
        .then((res) => {
          if (res.valid) {
            setAppliedCoupon({
              code: res.code,
              discount_amount: Number(res.discount_amount),
              message: res.message,
            });
          }
        })
        .catch(() => {});
    }
  }, [initialCoupon, subtotal]);

  const items = cart?.items || [];

  // Calculations
  const baseShippingFee = subtotal >= 3000 ? 0 : 250;
  const shippingFee = shippingMethod === 'express' ? baseShippingFee + 350 : baseShippingFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount_amount: Number(res.discount_amount),
          message: res.message,
        });
      } else {
        setCouponError(res.message);
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim() || !city.trim() || !province.trim()) {
      setFormError('Please fill in all mandatory customer and delivery details.');
      return;
    }

    // Phone validation (Pakistani format 03XXXXXXXXX or +923XXXXXXXXX)
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const phoneRegex = /^((\+92)|(0092)|(92)|0)?3[0-9]{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setFormError('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: cleanPhone,
        shipping_address: address.trim(),
        shipping_city: city.trim(),
        shipping_province: province.trim(),
        shipping_postal_code: postalCode.trim() || undefined,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        notes: notes.trim() || undefined,
      });

      // Clear local cart
      await clearCart();

      // Redirect to Order Success Page
      router.push(`/order-success/${order.order_number}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please review your cart and details.');
      setSubmitting(false);
    }
  };

  if (!cartLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6">
            Add smartphones or accessories to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/cart" className="hover:text-cyan-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Secure Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8">
          Checkout &amp; Delivery Details
        </h1>

        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Customer Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Muhammad Ali"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone (Pakistani) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="03001234567"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Our courier will send SMS delivery updates to this number
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Complete Street Address (House / Apt, Street, Sector) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={2}
                    placeholder="e.g. House # 12, Street 4, Sector F-8/2, near Jinnah Super"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Province <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                    >
                      {PAKISTANI_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="city-suggestions"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="e.g. Islamabad"
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                    />
                    <datalist id="city-suggestions">
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="44000"
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Delivery Instructions / Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call before arrival, leave with security"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Shipping & Payment Methods */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Shipping Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    shippingMethod === 'standard'
                      ? 'border-cyan-500 bg-cyan-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Standard Courier Delivery
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      2-4 business days (TCS / Leopards)
                    </span>
                    <span className="text-xs font-bold text-cyan-700 mt-1 block">
                      {baseShippingFee === 0 ? 'FREE' : formatPKR(baseShippingFee)}
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    shippingMethod === 'express'
                      ? 'border-cyan-500 bg-cyan-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Express Priority Dispatch
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Next-day delivery in major cities
                    </span>
                    <span className="text-xs font-bold text-cyan-700 mt-1 block">
                      +{formatPKR(baseShippingFee + 350)}
                    </span>
                  </div>
                </label>
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Payment Method
                </h3>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-cyan-500 bg-cyan-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="mt-1 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" /> Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Pay exact cash in Pakistani Rupees (PKR) upon delivery to the courier at your doorstep. No prepayment required.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    onClick={() => setPaymentMethod('Bank Transfer')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'Bank Transfer'
                        ? 'border-cyan-500 bg-cyan-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Bank Transfer'}
                      onChange={() => setPaymentMethod('Bank Transfer')}
                      className="mt-1 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" /> Direct Bank Transfer / IBFT
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Transfer to Mobixora Technologies (Meezan Bank / HBL). Account details provided immediately after checkout.
                      </p>
                    </div>
                  </label>

                  {/* Online Card */}
                  <label
                    onClick={() => setPaymentMethod('Online Payment')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'Online Payment'
                        ? 'border-cyan-500 bg-cyan-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Online Payment'}
                      onChange={() => setPaymentMethod('Online Payment')}
                      className="mt-1 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-600" /> Credit / Debit Card (Online)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Secure payment processing with 3D Secure verification for Pakistani and international cards.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 sticky top-28">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Review Your Order ({items.length} items)
              </h3>

              {/* Order items mini list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.images[0]?.image_url || ''}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity} {item.variant ? `(${item.variant.variant_value})` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {formatPKR(item.item_total)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon field */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 text-xs font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon &apos;{appliedCoupon.code}&apos; active (-{formatPKR(discountAmount)})
                  </p>
                )}
                {couponError && (
                  <p className="mt-2 text-xs font-semibold text-rose-500">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Cost Totals */}
              <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPKR(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 uppercase text-[11px]">Free</span> : formatPKR(shippingFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatPKR(total)}
                  </span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Your Order...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span> <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 text-center">
                <p className="flex items-center justify-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> By placing order you agree to Mobixora Terms
                </p>
                <p>PTA Approved Devices &bull; 100% Original</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
