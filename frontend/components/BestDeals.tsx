'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface BestDealsProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export function BestDeals({ products, onQuickView }: BestDealsProps) {
  // Countdown timer simulation (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products
    .filter((p) => typeof p.sale_price === 'number' && p.sale_price < p.price)
    .slice(0, 4);

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
              <span>Limited Time Promotions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Best Deals &amp; Discounts
            </h2>
          </div>

          {/* Flash Sale Countdown Timer */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Deals end in:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-black">
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span className="text-slate-500">:</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span className="text-slate-500">:</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
            <Link
              href="/shop?on_sale=true"
              className="ml-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((product) => (
            <div key={product.id} className="text-slate-900">
              <ProductCard product={product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
