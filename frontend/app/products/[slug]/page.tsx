'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw,
  Check, Share2, AlertCircle, Sparkles, ChevronRight, MessageSquare
} from 'lucide-react';
import { api, formatPKR } from '@/services/api';
import { Product, ProductVariant, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'shipping'>('specs');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await api.getProduct(slug);
        setProduct(prod);
        setSelectedImage(prod.images[0]?.image_url || '');
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }

        // Fetch related products from same category
        if (prod.category?.slug) {
          const relRes = await api.getProducts({ category: prod.category.slug, limit: 4 });
          setRelatedProducts(relRes.items.filter((item) => item.id !== prod.id));
        }

        // Fetch product reviews
        const rList = await api.getProductReviews(prod.id);
        setReviews(rList);
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading Mobixora product specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center px-4">
        <AlertCircle className="w-14 h-14 text-rose-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested product may have been relocated or is currently out of stock.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const basePrice = product.sale_price || product.price;
  const priceAdjustment = selectedVariant ? Number(selectedVariant.price_adjustment) : 0;
  const currentPrice = Number(basePrice) + priceAdjustment;
  const originalPrice = product.sale_price ? Number(product.price) + priceAdjustment : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (product.stock <= 0 || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant?.id || null, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) return;
    await addToCart(product.id, selectedVariant?.id || null, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewError('');
    try {
      const addedReview = await api.submitReview({
        product_id: product.id,
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews([addedReview, ...reviews]);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      setReviewError(err.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-cyan-600">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href="/shop" className="hover:text-cyan-600">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-cyan-600">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Product Card Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs mb-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
              <img
                src={selectedImage || product.images[0]?.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.image_url
                        ? 'border-cyan-500 scale-95 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Buy Section (7 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Brand and SKU */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 font-bold">
                  {product.brand?.name || 'Mobixora'}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400">
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
                <span className="text-xs font-bold text-slate-800">
                  {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviews_count || reviews.length} customer reviews)
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> PTA Approved
                </span>
              </div>

              {/* Price */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatPKR(currentPrice)}
                </span>
                {originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatPKR(originalPrice)}
                  </span>
                )}
                <span className="text-xs text-slate-500 ml-auto font-medium">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Availability:</span>
                {product.stock > 0 ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units ready for immediate dispatch)
                  </span>
                ) : (
                  <span className="font-bold text-rose-500">Out of Stock</span>
                )}
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                    Select Variant / Model:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-500/20 shadow-xs'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span>{v.variant_name}: {v.variant_value}</span>
                          {Number(v.price_adjustment) > 0 && (
                            <span className="text-[10px] text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded-md">
                              +{formatPKR(v.price_adjustment)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-slate-900 bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    cartSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {cartSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Your Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-cyan-400" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 rounded-2xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md active:scale-95"
                >
                  Buy Now &bull; Cash on Delivery
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    inWishlist
                      ? 'border-rose-300 bg-rose-50 text-rose-500'
                      : 'border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Free delivery over Rs. 3,000</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <RotateCcw className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>7-Day checking warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specifications, Description, Reviews, Shipping */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-12">
          {/* Tab Navigation Headers */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50">
            {[
              { id: 'specs', label: 'Specifications' },
              { id: 'desc', label: 'Description & Features' },
              { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
              { id: 'shipping', label: 'Delivery & Returns' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base mb-4">
                  Full Technical Specifications
                </h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.specifications.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-baseline justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-bold text-slate-500 uppercase tracking-wider">
                          {s.specification_name}
                        </span>
                        <span className="font-semibold text-slate-900 text-right ml-4">
                          {s.specification_value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Standard manufacturer technical specifications apply. Certified authentic product.
                  </p>
                )}
              </div>
            )}

            {/* 2. Description Tab */}
            {activeTab === 'desc' && (
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4">
                <p className="text-sm">{product.description}</p>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">What&apos;s in the Box</h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    <li>1x {product.name}</li>
                    <li>Official Brand Documentation &amp; Warranty Card</li>
                    <li>PTA Approval Verification Slip</li>
                    <li>Original Factory Sealed Packaging</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Write Review Form */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Leave a Verified Review</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Share your experience with other technology shoppers.
                  </p>

                  {reviewSuccess && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                      Your review has been successfully submitted! Thank you.
                    </div>
                  )}
                  {reviewError && (
                    <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating ? 'fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Your Feedback
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your honest opinion about build quality, performance, camera, or accessories..."
                        required
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No reviews submitted yet for this product. Be the first to share your thoughts!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {rev.user_name || 'Customer'}
                            </span>
                            {rev.is_verified_purchase && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString('en-PK')}
                          </span>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <h4 className="font-bold text-slate-900 text-sm">Delivery across Pakistan</h4>
                <p>
                  Mobixora delivers to over 250 cities and towns in Pakistan. Orders placed before 3:00 PM (PKT) are dispatched on the same business day via TCS, Leopards, or Trax courier services.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-1">Standard Delivery</h5>
                    <p className="text-slate-500">2-4 business days. Free for orders of Rs. 3,000 or more (otherwise Rs. 250 flat fee).</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-1">Cash on Delivery (COD)</h5>
                    <p className="text-slate-500">Available nationwide. Pay exact cash to the courier representative upon package delivery.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
