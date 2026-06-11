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
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    postal_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });
  const [shippingError, setShippingError] = useState("");

  function setShippingField(field: keyof typeof shipping, value: string) {
    setShipping({ ...shipping, [field]: value });
  }

  function validateShipping() {
    if (items.length === 0) {
      setShippingError("Adicione pelo menos um produto ao carrinho.");
      return false;
    }

    const requiredFields: Array<keyof typeof shipping> = [
      "name",
      "email",
      "phone",
      "postal_code",
      "street",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state"
    ];

    for (const field of requiredFields) {
      if (!shipping[field].trim()) {
        setShippingError("Preencha todos os campos de entrega.");
        return false;
      }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(shipping.email)) {
      setShippingError("Informe um e-mail válido.");
      return false;
    }

    const cepDigits = shipping.postal_code.replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      setShippingError("Informe um CEP válido com 8 dígitos.");
      return false;
    }

    setShippingError("");
    return true;
  }

  async function checkout() {
    if (!validateShipping()) return;


    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        shipping: {
          name: shipping.name,
          email: shipping.email,
          phone: shipping.phone,
          postal_code: shipping.postal_code,
          street: shipping.street,
          number: shipping.number,
          complement: shipping.complement,
          neighborhood: shipping.neighborhood,
          city: shipping.city,
          state: shipping.state
        }
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

  const shippingCents = 2990;
  const orderTotalCents = totalCents + shippingCents;

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

              <section className="rounded border border-facheiro-linen bg-white p-4">
                <h2 className="mb-4 text-lg font-semibold text-facheiro-brown">Dados de entrega</h2>
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Nome completo
                      <input
                        value={shipping.name}
                        onChange={(event) => setShippingField("name", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      Email
                      <input
                        value={shipping.email}
                        onChange={(event) => setShippingField("email", event.target.value)}
                        type="email"
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                  </div>
                  <label className="text-sm">
                    Telefone
                    <input
                      value={shipping.phone}
                      onChange={(event) => setShippingField("phone", event.target.value)}
                      className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      CEP
                      <input
                        value={shipping.postal_code}
                        onChange={(event) => setShippingField("postal_code", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      Rua
                      <input
                        value={shipping.street}
                        onChange={(event) => setShippingField("street", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm">
                      Número
                      <input
                        value={shipping.number}
                        onChange={(event) => setShippingField("number", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      Complemento
                      <input
                        value={shipping.complement}
                        onChange={(event) => setShippingField("complement", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      Bairro
                      <input
                        value={shipping.neighborhood}
                        onChange={(event) => setShippingField("neighborhood", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Cidade
                      <input
                        value={shipping.city}
                        onChange={(event) => setShippingField("city", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                    <label className="text-sm">
                      Estado
                      <input
                        value={shipping.state}
                        onChange={(event) => setShippingField("state", event.target.value)}
                        className="mt-2 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3 outline-none"
                      />
                    </label>
                  </div>
                  {shippingError ? <p className="text-sm text-red-700">{shippingError}</p> : null}
                </div>
              </section>

              <section className="rounded border border-facheiro-linen bg-white p-4">
                <h2 className="text-lg font-semibold text-facheiro-brown">Frete</h2>
                <p className="mt-3 text-sm text-facheiro-black/70">Valor fixo de frete para todos os pedidos.</p>
                <p className="mt-4 text-lg font-semibold">{formatMoney(2990)}</p>
              </section>
            </div>
          )}
        </div>
        <footer className="border-t border-facheiro-linen p-5">
          <div className="mb-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatMoney(totalCents)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Frete</span>
              <strong>{formatMoney(shippingCents)}</strong>
            </div>
            <div className="flex justify-between border-t border-facheiro-linen pt-4 font-semibold">
              <span>Total</span>
              <strong>{formatMoney(orderTotalCents)}</strong>
            </div>
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
