'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, variantId?: number | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshCart = async () => {
    try {
      const c = await api.getCart();
      setCart(c);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, variantId?: number | null, quantity: number = 1) => {
    const updated = await api.addToCart(productId, variantId, quantity);
    setCart(updated);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const updated = await api.updateCartItem(itemId, quantity);
    setCart(updated);
  };

  const removeItem = async (itemId: number) => {
    const updated = await api.removeCartItem(itemId);
    setCart(updated);
  };

  const clearCart = async () => {
    const updated = await api.clearCart();
    setCart(updated);
  };

  const totalCount = cart?.items_count || 0;
  const subtotal = cart?.subtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
