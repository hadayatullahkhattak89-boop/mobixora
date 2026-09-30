'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  // If API categories aren't loaded yet, provide the 8 featured defaults
  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Smartphones', slug: 'smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80', description: 'Flagship mobile devices', is_active: true },
    { id: 2, name: 'iPhones', slug: 'iphones', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80', description: 'Apple iOS ecosystem', is_active: true },
    { id: 3, name: 'Android Phones', slug: 'android-phones', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', description: 'Samsung, Xiaomi & more', is_active: true },
    { id: 4, name: 'Chargers', slug: 'chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', description: 'GaN & Super Fast 45W', is_active: true },
    { id: 5, name: 'Earbuds', slug: 'earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', description: 'Wireless & ANC Audio', is_active: true },
    { id: 6, name: 'Power Banks', slug: 'power-banks', image: 'https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=600&auto=format&fit=crop&q=80', description: 'High capacity battery packs', is_active: true },
    { id: 7, name: 'Smart Watches', slug: 'smart-watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', description: 'Fitness & Health trackers', is_active: true },
    { id: 8, name: 'Mobile Covers', slug: 'mobile-covers', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80', description: 'Drop-proof military cases', is_active: true },
  ];

  return (
    <section className="py-16 bg-slate-50/60 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 block mb-1">
              Browse Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-slate-600 hover:text-cyan-600 flex items-center gap-1 transition-colors"
          >
            Explore all products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 group-hover:bg-cyan-500 group-hover:text-white transition-colors shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-cyan-600 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
