'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal, Search, X, Check, Star,
  RotateCcw, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { api, formatPKR } from '@/services/api';
import { Product, Category, Brand } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialSale = searchParams.get('on_sale') === 'true';
  const initialFeatured = searchParams.get('is_featured') === 'true';
  const initialNew = searchParams.get('is_new') === 'true';

  // Filters state
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(initialSale);
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // UI state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load filter options (categories & brands)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cList, bList] = await Promise.all([
          api.getCategories(),
          api.getBrands(),
        ]);
        setCategories(cList);
        setBrands(bList);
      } catch (e) {
        console.error('Error loading filter options', e);
      }
    }
    loadMeta();
  }, []);

  // Sync state if URL query changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setSearch(searchParams.get('q') || '');
    setOnSaleOnly(searchParams.get('on_sale') === 'true');
    setPage(1);
  }, [searchParams]);

  // Load products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 12,
          sort,
        };
        if (search.trim()) params.q = search.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (minRating) params.min_rating = minRating;
        if (inStockOnly) params.in_stock = true;
        if (onSaleOnly) params.on_sale = true;
        if (initialFeatured) params.is_featured = true;
        if (initialNew) params.is_new = true;

        const res = await api.getProducts(params);
        setProducts(res.items);
        setTotalCount(res.total);
        setTotalPages(res.pages);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    page, sort, selectedCategory, selectedBrand,
    minPrice, maxPrice, minRating, inStockOnly,
    onSaleOnly, search, initialFeatured, initialNew
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSort('newest');
    setPage(1);
    router.push('/shop');
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600" /> Filters
        </h3>
        {(selectedCategory || selectedBrand || search || minPrice || maxPrice || minRating || inStockOnly || onSaleOnly) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
              selectedCategory === ''
                ? 'bg-cyan-50 text-cyan-700 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCategory(selectedCategory === c.slug ? '' : c.slug);
                setPage(1);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                selectedCategory === c.slug
                  ? 'bg-cyan-50 text-cyan-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{c.name}</span>
              {selectedCategory === c.slug && <Check className="w-3.5 h-3.5 text-cyan-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => { setSelectedBrand(''); setPage(1); }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
              selectedBrand === ''
                ? 'bg-cyan-50 text-cyan-700 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Brands</span>
            {selectedBrand === '' && <Check className="w-3.5 h-3.5 text-cyan-600" />}
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBrand(selectedBrand === b.slug ? '' : b.slug);
                setPage(1);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                selectedBrand === b.slug
                  ? 'bg-cyan-50 text-cyan-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{b.name}</span>
              {selectedBrand === b.slug && <Check className="w-3.5 h-3.5 text-cyan-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Price Range (PKR)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Rs."
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-cyan-500"
          />
          <input
            type="number"
            placeholder="Max Rs."
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setMinRating(minRating === r ? null : r);
                setPage(1);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                minRating === r ? 'bg-cyan-50 text-cyan-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < r ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span>&amp; up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 border-slate-300"
          />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => { setOnSaleOnly(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded-sm text-cyan-600 focus:ring-cyan-500 border-slate-300"
          />
          <span>On Sale / Discounted</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Shop</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-cyan-600 capitalize font-semibold">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse our complete selection of authentic smartphones, GaN fast chargers, and smart tech.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span>Filters ({[selectedCategory, selectedBrand, minPrice, minRating, inStockOnly, onSaleOnly].filter(Boolean).length})</span>
          </button>

          {/* Search in Shop */}
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter by name, model or SKU..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Results count & Sort */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{products.length}</span> of {totalCount} products
            </span>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2 outline-hidden focus:border-cyan-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Popular Flagships</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shop Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-fit sticky top-28">
            <FilterSidebar />
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto my-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No products match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Try adjusting or resetting your search filters to find what you are looking for.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onQuickView={(prod) => setQuickViewProduct(prod)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(totalPages)].map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setPage(pNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                            page === pNum
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-bold"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col z-50 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <span className="font-bold text-slate-900 text-sm">Product Filters</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-cyan-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
