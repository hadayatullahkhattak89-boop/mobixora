'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <section className="py-16 bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
          Get the Latest Deals &amp; Updates
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
          Subscribe to the Mobixora newsletter and receive exclusive discount coupons, early access to flagship smartphone launches, and flash sales.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold animate-in zoom-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Thank you for subscribing! Check your inbox for Rs. 500 off coupon.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full sm:flex-1 px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 outline-hidden transition-all"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
            >
              <span>Subscribe</span> <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-400 mt-4">
          No spam, ever. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
}
