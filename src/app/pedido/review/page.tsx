"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/format";

type OrderData = {
  items: Array<{
    product_id: string;
    sku: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }>;
  shipping: {
    name: string;
    email: string;
    phone: string;
    postal_code: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping_quote: {
    service: string;
    name: string;
    price: number;
    price_cents: number;
    delivery_time: number;
  };
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
};

export default function OrderReview() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("pending_order");
    if (stored) {
      try {
        setOrderData(JSON.parse(stored));
      } catch {
        setError("Erro ao carregar pedido");
      }
    }
  }, []);

  async function confirmOrder() {
    if (!orderData) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Erro ao confirmar pedido.");
      return;
    }

    window.location.href = payload.init_point;
  }

  if (!orderData) {
    return (
      <main className="container-page py-14">
        <div className="max-w-2xl">
          <h1 className="font-serif text-5xl text-facheiro-brown">Carregando...</h1>
          {error && <p className="mt-4 text-red-700">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="font-serif text-5xl text-facheiro-brown">Revise seu pedido</h1>

        <section className="mt-8 rounded border border-facheiro-linen bg-white p-6">
          <h2 className="font-serif text-2xl text-facheiro-brown">Produtos</h2>
          <div className="mt-4 space-y-4">
            {orderData.items.map((item) => (
              <div key={item.product_id} className="flex justify-between border-b border-facheiro-linen pb-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-facheiro-black/60">SKU: {item.sku}</p>
                  <p className="text-sm">Quantidade: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatMoney(item.total_cents)}</p>
                  <p className="text-sm text-facheiro-black/60">{formatMoney(item.unit_price_cents)} cada</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded border border-facheiro-linen bg-white p-6">
          <h2 className="font-serif text-2xl text-facheiro-brown">Endereço de entrega</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>{orderData.shipping.name}</strong>
            </p>
            <p>
              {orderData.shipping.street}, {orderData.shipping.number}
              {orderData.shipping.complement && ` - ${orderData.shipping.complement}`}
            </p>
            <p>
              {orderData.shipping.neighborhood}, {orderData.shipping.city} - {orderData.shipping.state}
            </p>
            <p>CEP: {orderData.shipping.postal_code}</p>
            <p>Email: {orderData.shipping.email}</p>
            <p>Telefone: {orderData.shipping.phone}</p>
          </div>
        </section>

        <section className="mt-6 rounded border border-facheiro-linen bg-white p-6">
          <h2 className="font-serif text-2xl text-facheiro-brown">Resumo do pedido</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <strong>{formatMoney(orderData.subtotal_cents)}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frete ({orderData.shipping_quote.name})</span>
              <strong>{formatMoney(orderData.shipping_cents)}</strong>
            </div>
            <div className="flex justify-between border-t border-facheiro-linen pt-3 font-serif text-lg">
              <span>Total</span>
              <strong>{formatMoney(orderData.total_cents)}</strong>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="focus-ring rounded border border-facheiro-brown px-6 py-3 text-center text-sm uppercase tracking-[0.16em] text-facheiro-brown"
          >
            Voltar ao carrinho
          </Link>
          <button
            className="focus-ring rounded bg-facheiro-brown px-6 py-3 text-sm uppercase tracking-[0.16em] text-facheiro-off disabled:cursor-not-allowed disabled:opacity-50"
            onClick={confirmOrder}
            disabled={loading}
          >
            {loading ? "Processando..." : "Confirmar e pagar"}
          </button>
        </div>

        {error && <p className="mt-4 text-center text-red-700">{error}</p>}
      </div>
    </main>
  );
}
