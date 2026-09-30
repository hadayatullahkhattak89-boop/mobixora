'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatPKR } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const price = product.sale_price || product.price;
  const originalPrice = product.sale_price ? product.price : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      await addToCart(product.id, null, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    await toggleWishlist(product.id);
  };

  const mainImage = product.images[0]?.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercent > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.is_new && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-white shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          inWishlist
            ? 'bg-rose-50 text-rose-500'
            : 'bg-white/80 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
        }`}
        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-square bg-slate-50 overflow-hidden"
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Floating Button */}
        {onQuickView && (
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold shadow-lg hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
          <span className="uppercase tracking-wider font-semibold text-cyan-600">
            {product.brand?.name || 'Mobixora'}
          </span>
          <span>{product.category?.name || 'Electronics'}</span>
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-cyan-600 transition-colors mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-700">
            {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
          </span>
          <span className="text-[11px] text-slate-400">
            ({product.reviews_count || 1})
          </span>
        </div>

        {/* Price & Stock info */}
        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-slate-900">
                {formatPKR(price)}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPKR(originalPrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-0.5">
              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
                  <AlertCircle className="w-2.5 h-2.5" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-bold text-amber-600">
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="text-[10px] font-medium text-emerald-600">
                  In Stock (PTA)
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : added
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-900 hover:bg-cyan-600 text-white shadow-sm hover:scale-105 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
          >
            {added ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
