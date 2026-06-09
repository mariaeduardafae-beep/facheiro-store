"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalCents: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const totalCents = items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isOpen,
      totalCents,
      count,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product) => {
        if (product.stock <= 0) return;
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (!existing) return [...current, { product, quantity: 1 }];
          return current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
              : item
          );
        });
        setIsOpen(true);
      },
      removeItem: (productId) => setItems((current) => current.filter((item) => item.product.id !== productId)),
      updateQuantity: (productId, quantity) =>
        setItems((current) =>
          current
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
                : item
            )
            .filter((item) => item.quantity > 0)
        )
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
