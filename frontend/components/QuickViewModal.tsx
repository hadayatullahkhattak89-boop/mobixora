'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, ShoppingCart, Check, Heart, ShieldCheck, Truck } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPKR } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentImage = selectedImage || product.images[0]?.image_url || '';
  const inWishlist = isInWishlist(product.id);

  const basePrice = product.sale_price || product.price;
  const priceAdjustment = selectedVariant ? Number(selectedVariant.price_adjustment) : 0;
  const finalPrice = Number(basePrice) + priceAdjustment;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, selectedVariant?.id || null, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Error adding to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Column */}
        <div className="p-6 bg-slate-50 flex flex-col items-center justify-center">
          <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center mb-4">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 w-full overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    currentImage === img.image_url ? 'border-cyan-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
              <span className="text-cyan-600">{product.brand?.name}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">
                {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-slate-400">({product.reviews_count || 1} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-slate-900">
                {formatPKR(finalPrice)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPKR(product.price)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Variants if any */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Select Option:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(isSelected ? null : v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-500/20'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {v.variant_value}
                        {Number(v.price_adjustment) > 0 && (
                          <span className="ml-1 text-[10px] text-slate-400">
                            (+{formatPKR(v.price_adjustment)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400">
                ({product.stock} available in stock)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding || product.stock <= 0}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 hover:bg-cyan-600 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  inWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs font-bold text-cyan-600 hover:text-cyan-700 py-1"
            >
              View Full Product Details &amp; Specifications &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
