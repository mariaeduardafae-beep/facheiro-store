"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { fallbackProductImage } from "@/lib/images";
import { useCart } from "@/components/cart-provider";

export function CartDrawer() {
  const { items, isOpen, closeCart, totalCents, removeItem, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }))
      })
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Não foi possível iniciar o checkout.");
      return;
    }
    window.location.href = payload.init_point;
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Fechar carrinho"
        onClick={closeCart}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-facheiro-off shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrinho"
      >
        <header className="flex items-center justify-between border-b border-facheiro-linen px-5 py-4">
          <p className="font-serif text-3xl text-facheiro-brown">Carrinho</p>
          <button className="focus-ring p-2" onClick={closeCart} aria-label="Fechar carrinho">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="pt-12 text-center text-sm text-facheiro-black/70">Seu carrinho está vazio.</p>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.product.id} className="grid grid-cols-[84px_1fr] gap-4">
                  <div className="relative aspect-square overflow-hidden bg-facheiro-linen">
                    <Image
                      src={item.product.images[0] ?? fallbackProductImage}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="84px"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="mt-1 text-xs uppercase text-facheiro-black/55">{item.product.sku}</p>
                      </div>
                      <button className="focus-ring h-8 w-8" onClick={() => removeItem(item.product.id)} aria-label="Remover">
                        <X size={15} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex h-9 items-center border border-facheiro-linen">
                        <button
                          className="focus-ring grid h-9 w-9 place-items-center"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          className="focus-ring grid h-9 w-9 place-items-center"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm">{formatMoney(item.product.price_cents * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <footer className="border-t border-facheiro-linen p-5">
          <div className="mb-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <strong>{formatMoney(totalCents)}</strong>
          </div>
          {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
          <button
            className="focus-ring w-full bg-facheiro-brown px-5 py-4 text-sm uppercase tracking-[0.16em] text-facheiro-off disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!items.length || loading}
            onClick={checkout}
          >
            {loading ? "Preparando checkout" : "Finalizar compra"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
