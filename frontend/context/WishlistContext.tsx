'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WishlistItem } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const items = await api.getWishlist();
      setWishlist(items);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!user) {
      // Return false if unauthenticated so UI can prompt login
      return false;
    }
    const res = await api.toggleWishlist(productId);
    await refreshWishlist();
    return res.in_wishlist;
  };

  const removeFromWishlist = async (productId: number) => {
    await api.removeFromWishlist(productId);
    setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
        totalWishlist: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
