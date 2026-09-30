import React from 'react';
import Link from 'next/link';
import { Brand } from '@/types';

interface PopularBrandsProps {
  brands: Brand[];
}

export function PopularBrands({ brands }: PopularBrandsProps) {
  return (
    <section id="brands" className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 block mb-1">
            Authorized Partners
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Brands
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Explore authentic technology and smartphones from the world&apos;s leading manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/shop?brand=${b.slug}`}
              className="group p-5 rounded-2xl border border-slate-100 hover:border-cyan-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-white"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center overflow-hidden mb-3 group-hover:scale-110 transition-transform">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-slate-800">{b.name[0]}</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
