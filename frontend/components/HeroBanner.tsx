import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24">
      {/* High-tech background glow & mesh grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.25),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-semibold backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Mobixora &bull; Smart Tech. Better Life.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Everything Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Mobile Needs
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover the latest smartphones and premium mobile accessories at great prices. Authentic PTA-approved flagships, GaN fast chargers, and smart wearables delivered across Pakistan.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=chargers"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                Explore Accessories
              </Link>
            </div>

            {/* Key Value Points */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-400 border-t border-slate-900/80">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100% PTA Approved</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Official Warranty</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visuals Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Smartphone Card */}
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-5 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"
                    alt="Apple iPhone 16 Pro Max on Mobixora"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-400 uppercase tracking-wider border border-cyan-500/20">
                    Flagship Arrival
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md text-white text-xs font-black shadow-lg">
                    Rs. 479,999
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">iPhone 16 Pro Max</h3>
                    <p className="text-xs text-slate-400">Grade 5 Titanium &bull; A18 Pro</p>
                  </div>
                  <Link
                    href="/products/apple-iphone-16-pro-max"
                    className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors font-bold text-xs"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Floating Mini Accessory Badge */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80"
                  alt="AirPods Pro 2"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white">AirPods Pro 2</p>
                  <p className="text-[11px] text-cyan-400 font-semibold">Rs. 68,999</p>
                </div>
              </div>

              {/* Floating GaN Charger Mini Badge */}
              <div className="absolute -top-6 -right-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">67W GaN Fast Charger</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">3-Port Multi-Charge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
