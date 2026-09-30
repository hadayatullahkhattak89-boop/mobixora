'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User as UserIcon, Menu, X,
  ChevronDown, Phone, ShieldCheck, Truck, Sparkles, LogOut,
  LayoutDashboard, Package, MapPin
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api, formatPKR } from '@/services/api';
import { Product } from '@/types';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalCount, subtotal } = useCart();
  const { totalWishlist } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ q: searchQuery.trim(), limit: 5 });
        setSuggestions(res.items);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Smartphones', href: '/shop?category=smartphones' },
    { label: 'Accessories', href: '/shop?category=chargers' },
    { label: 'Brands', href: '/shop#brands' },
    { label: 'Deals', href: '/shop?on_sale=true' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Truck className="w-3.5 h-3.5" /> Free Nationwide Delivery on orders over Rs. 3,000
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Original & PTA Approved
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-cyan-400" /> Helpline: 0300-MOBIXORA
            </span>
            <span className="text-slate-600">|</span>
            <Link href="/track-order" className="hover:text-cyan-400 transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Logo size="md" />

        {/* Search Bar */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search smartphones, chargers, earbuds, brands, SKU..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-full pl-5 pr-12 py-2.5 border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-hidden"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Search Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Product Suggestions
              </div>
              <div className="divide-y divide-slate-50">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={item.images[0]?.image_url || '/placeholder.png'}
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.brand?.name || 'Mobixora'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-cyan-600">
                        {formatPKR(item.sale_price || item.price)}
                      </p>
                      {item.sale_price && (
                        <p className="text-[10px] text-slate-400 line-through">
                          {formatPKR(item.price)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  View all results for &quot;{searchQuery}&quot; &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Icons (Wishlist, Account, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Wishlist */}
          <Link
            href={user ? '/account?tab=wishlist' : '/login?redirect=/account?tab=wishlist'}
            className="relative p-2.5 text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {totalWishlist > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {totalWishlist}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-cyan-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-700 flex items-center justify-center font-bold text-xs">
                {user ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Account</span>
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[90px]">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-600" /> Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                    </Link>

                    <Link
                      href="/account?tab=addresses"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" /> Saved Addresses
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 text-center border-b border-slate-100">
                      <p className="text-xs text-slate-600 mb-2">Welcome to Mobixora</p>
                      <Link
                        href="/login"
                        className="block w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity"
                      >
                        Sign In
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-2">
                        New customer?{' '}
                        <Link href="/register" className="text-cyan-600 font-semibold hover:underline">
                          Create account
                        </Link>
                      </p>
                    </div>
                    <Link
                      href="/track-order"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Truck className="w-4 h-4 text-slate-400" /> Track Guest Order
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon & Total */}
          <Link
            href="/cart"
            className="flex items-center gap-2.5 pl-2.5 pr-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Cart</span>
              <span className="text-xs font-bold text-white">{formatPKR(subtotal)}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Nav Links Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-colors py-1 ${
                      isActive ? 'text-cyan-600 font-bold border-b-2 border-cyan-500' : 'hover:text-cyan-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col z-50 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100 text-slate-900 text-sm rounded-xl pl-4 pr-10 py-2.5 border border-slate-200 outline-hidden"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Nav Links */}
            <ul className="mt-6 flex flex-col gap-1 divide-y divide-slate-100 text-sm font-medium text-slate-800">
              {navLinks.map((link) => (
                <li key={link.href} className="pt-2">
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 hover:text-cyan-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Bottom Account CTA in Mobile Drawer */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-500">Signed in as {user.name}</p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-slate-100 text-slate-800 rounded-xl"
                  >
                    Customer Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-xs font-semibold bg-cyan-500 text-white rounded-xl"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 text-left py-1 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
