import React from 'react';
import { ShieldCheck, Truck, CreditCard, RotateCcw, Headphones, Award } from 'lucide-react';

export function WhyChooseUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Original Products',
      description: 'Guaranteed authentic tech sourced directly from authorized brand distributors. PTA approved with verified IMEI.',
      color: 'text-cyan-500 bg-cyan-50',
    },
    {
      icon: Truck,
      title: 'Fast Nationwide Delivery',
      description: 'Express shipping across all major cities of Pakistan including Islamabad, Lahore, Karachi, Rawalpindi, and Peshawar.',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments & COD',
      description: 'Pay safely with Cash on Delivery at your doorstep or via direct secure Bank Transfer and online cards.',
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      description: 'Shop with full confidence with our customer-first 7-day checking warranty and replacement support.',
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      icon: Headphones,
      title: 'Dedicated Customer Support',
      description: 'Our tech experts are available 6 days a week to help with product queries, setup, and order tracking.',
      color: 'text-rose-500 bg-rose-50',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 block mb-1">
            The Mobixora Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Mobixora
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            We are dedicated to bringing high-tech smartphones and reliable accessories with honest pricing and five-star service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4 shrink-0`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
