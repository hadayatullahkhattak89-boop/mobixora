import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck,
  Truck, RotateCcw, Headphones
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-900 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Original Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">PTA Approved with Official Warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Fast Delivery Nationwide</h4>
              <p className="text-xs text-slate-400 mt-0.5">Free delivery on orders over Rs. 3,000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">24/7 Customer Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Dedicated technical support helpline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" light />
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Mobixora is Pakistan&apos;s trusted premium technology store specializing in original smartphones, smart wearables, and authentic mobile accessories. Delivering innovation right to your doorstep.
            </p>

            <div className="pt-2 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Sector F-7/Blue Area, Islamabad & Clifton, Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>UAN: +92 51 111-MOBIX (66249) / 0300-MOBIXORA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>support@mobixora.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Mon - Sat: 9:00 AM - 10:00 PM (PKT)</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-3 flex items-center gap-3">
              {['Facebook', 'Instagram', 'TikTok', 'YouTube'].map((net) => (
                <span
                  key={net}
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  title={`Follow us on ${net}`}
                >
                  {net[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/shop?category=smartphones" className="hover:text-cyan-400 transition-colors">Smartphones</Link></li>
              <li><Link href="/shop?category=iphones" className="hover:text-cyan-400 transition-colors">Apple iPhones</Link></li>
              <li><Link href="/shop?category=android-phones" className="hover:text-cyan-400 transition-colors">Android Phones</Link></li>
              <li><Link href="/shop?category=chargers" className="hover:text-cyan-400 transition-colors">GaN Fast Chargers</Link></li>
              <li><Link href="/shop?category=earbuds" className="hover:text-cyan-400 transition-colors">Wireless Earbuds</Link></li>
              <li><Link href="/shop?category=power-banks" className="hover:text-cyan-400 transition-colors">Power Banks</Link></li>
              <li><Link href="/shop?category=smart-watches" className="hover:text-cyan-400 transition-colors">Smart Watches</Link></li>
              <li><Link href="/shop?category=mobile-covers" className="hover:text-cyan-400 transition-colors">Protective Cases</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/track-order" className="hover:text-cyan-400 transition-colors">Track Your Order</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Mobixora</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Helpline</Link></li>
              <li><Link href="/shop?on_sale=true" className="hover:text-cyan-400 transition-colors">Deals & Discounts</Link></li>
              <li><Link href="/account" className="hover:text-cyan-400 transition-colors">Customer Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Account Sign In</Link></li>
            </ul>
          </div>

          {/* Policies & Badges */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Policies & Security</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about#privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/about#terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/about#returns" className="hover:text-cyan-400 transition-colors">7-Day Return Policy</Link></li>
              <li><Link href="/about#shipping" className="hover:text-cyan-400 transition-colors">Shipping & Delivery Rates</Link></li>
              <li><Link href="/about#pta" className="hover:text-cyan-400 transition-colors">PTA Verification Guide</Link></li>
            </ul>

            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Supported Payment Methods
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-emerald-400">Cash on Delivery</span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-cyan-400">Bank Transfer</span>
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300">Visa / Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-900 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Mobixora. All rights reserved. Smart Tech. Better Life.</p>
          <p className="text-[11px] text-slate-500">
            Designed for high performance e-commerce with Next.js, FastAPI & MySQL.
          </p>
        </div>
      </div>
    </footer>
  );
}
