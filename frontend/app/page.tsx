'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/HeroBanner';
import { FeaturedCategories } from '@/components/FeaturedCategories';
import { ProductCard } from '@/components/ProductCard';
import { BestDeals } from '@/components/BestDeals';
import { PopularBrands } from '@/components/PopularBrands';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { CustomerReviews } from '@/components/CustomerReviews';
import { Newsletter } from '@/components/Newsletter';
import { QuickViewModal } from '@/components/QuickViewModal';
import { api } from '@/services/api';
import { Product, Category, Brand, Review } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, featRes, newRes, catRes, brandRes, revRes] = await Promise.all([
          api.getProducts({ limit: 16 }),
          api.getProducts({ is_featured: true, limit: 8 }),
          api.getProducts({ is_new: true, limit: 8 }),
          api.getCategories(),
          api.getBrands(),
          api.getRecentReviews(6),
        ]);

        setAllProducts(prodRes.items);
        setFeaturedProducts(featRes.items);
        setNewArrivals(newRes.items);
        setCategories(catRes);
        setBrands(brandRes);
        setReviews(revRes);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Featured Categories */}
      <FeaturedCategories categories={categories} />

      {/* 3. Featured Products */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 block mb-1">
                Top Rated By Customers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop?is_featured=true"
              className="text-xs font-bold text-slate-600 hover:text-cyan-600 flex items-center gap-1 transition-colors"
            >
              See all featured &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Best Deals (Promotional) */}
      <BestDeals
        products={allProducts}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* 5. Popular Brands */}
      <PopularBrands brands={brands} />

      {/* 6. New Arrivals */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Just Landed
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop?is_new=true"
              className="text-xs font-bold text-slate-600 hover:text-cyan-600 flex items-center gap-1 transition-colors"
            >
              Explore latest tech &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Why Choose Mobixora */}
      <WhyChooseUs />

      {/* 8. Customer Reviews */}
      <CustomerReviews reviews={reviews} />

      {/* 9. Newsletter */}
      <Newsletter />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
