import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Award, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Brand Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
          <Logo size="lg" className="justify-center" />
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight pt-2">
            Smart Tech. Better Life.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Mobixora is Pakistan&apos;s modern online technology store specializing in original smartphones, smart devices, and high-performance mobile accessories. We bridge global innovation with Pakistani consumers through authentic products, honest pricing, and unmatched service.
          </p>
        </div>

        {/* Pillars of Mobixora */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">100% PTA Approved</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every smartphone sold on Mobixora carries authentic PTA approval verified via DIRBS. You receive sealed retail boxes with official tax clearance.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Official Manufacturer Warranty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We partner directly with authorized distributors of Apple, Samsung, Xiaomi, Anker, and Spigen to ensure seamless warranty claims for our customers.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Express Cash on Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experience the safest shopping experience with Cash on Delivery available across all provinces, districts, and tehsils in Pakistan.
            </p>
          </div>
        </div>

        {/* Policies Section */}
        <div id="returns" className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
            Policies &amp; Customer Commitments
          </h2>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">7-Day Replacement Policy</h4>
              <p>
                If your device or accessory arrives damaged or experiences manufacturing defects, contact our helpline within 7 days of delivery for an immediate inspection and replacement.
              </p>
            </div>

            <div id="shipping" className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Shipping &amp; Delivery Timeline</h4>
              <p>
                All orders are dispatched via tracked courier partners (TCS / Leopards / Trax). Major metropolitan cities (Islamabad, Rawalpindi, Lahore, Karachi) enjoy 1-3 business days delivery. Free shipping applies to all orders totaling Rs. 3,000 or more.
              </p>
            </div>

            <div id="privacy" className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Privacy &amp; Data Security</h4>
              <p>
                Mobixora utilizes modern encryption, JWT authorization, and zero plain-text password storage. Your personal information, delivery addresses, and order histories are strictly protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
