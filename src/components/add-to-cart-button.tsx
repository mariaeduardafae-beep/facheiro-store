"use client";

import type { Product } from "@/lib/types";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <button
      className="focus-ring w-full bg-facheiro-brown px-5 py-4 font-serif text-base uppercase tracking-[0.18em] text-facheiro-off hover:bg-facheiro-leather transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-facheiro-black/25"
      disabled={soldOut}
      onClick={() => addItem(product)}
    >
      {soldOut ? "Esgotado" : "Comprar"}
    </button>
  );
}
