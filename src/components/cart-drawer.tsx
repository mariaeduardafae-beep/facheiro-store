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
    const response = await fetch("/api/checkout/review", {
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
      setError(payload.error ?? "Não foi possível processar o pedido.");
      return;
    }
    localStorage.setItem("pending_order", JSON.stringify(payload.order_data));
    window.location.href = "/pedido/review";
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
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-facheiro-pattern-light rounded border border-dashed border-facheiro-linen my-4">
              <svg viewBox="0 0 100 100" className="h-20 w-auto text-facheiro-brown/20 fill-none stroke-current stroke-[2.2] mb-5" style={{ strokeLinecap: "round", strokeLinejoin: "round" }}>
                <path d="M 50,90 L 50,25" />
                <path d="M 47,27 L 50,23 L 52,27" />
                <path d="M 50,23 L 50,20" />
                <path d="M 50,80 C 44,80 42,73 42,62 L 42,38" />
                <path d="M 39,40 L 42,36 L 45,40" />
                <path d="M 42,36 L 42,33" />
                <path d="M 50,80 C 56,80 58,73 58,62 L 58,38" />
                <path d="M 56,40 L 59,36 L 62,40" />
                <path d="M 59,36 L 59,33" />
                <path d="M 50,85 C 34,85 32,73 32,57 L 32,32" />
                <path d="M 29,34 L 32,30 L 35,34" />
                <path d="M 32,30 L 32,27" />
                <path d="M 50,85 C 66,85 68,73 68,57 L 68,32" />
                <path d="M 65,34 L 68,30 L 71,34" />
                <path d="M 68,30 L 68,27" />
              </svg>
              <p className="font-serif text-xl text-facheiro-brown uppercase tracking-widest">Seu carrinho está vazio</p>
              <p className="mt-2 text-xs text-facheiro-black/60 max-w-[240px]">
                Navegue pelas nossas coleções e adicione peças autorais à sua coleção.
              </p>
              <button onClick={closeCart} className="focus-ring mt-6 border border-facheiro-brown px-5 py-2.5 font-serif text-xs uppercase tracking-[0.16em] text-facheiro-brown hover:bg-facheiro-brown hover:text-facheiro-off transition-colors duration-200">
                Voltar às compras
              </button>
            </div>
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
                        <p className="font-serif text-lg uppercase tracking-[0.05em] text-facheiro-brown">{item.product.name}</p>
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
                      <p className="font-serif text-base text-facheiro-leather">{formatMoney(item.product.price_cents * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}

              <section className="rounded border border-facheiro-linen bg-white p-4">
                <h2 className="mb-4 font-serif text-xl tracking-[0.08em] uppercase text-facheiro-brown">Dados de entrega</h2>
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
                <h2 className="font-serif text-xl tracking-[0.08em] uppercase text-facheiro-brown">Frete</h2>
                <p className="mt-3 text-sm text-facheiro-black/70">Valor fixo de frete para todos os pedidos.</p>
                <p className="mt-4 font-serif text-lg text-facheiro-leather">{formatMoney(2990)}</p>
              </section>
            </div>
          )}
        </div>
        <footer className="border-t border-facheiro-linen p-5">
          <div className="mb-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong className="font-serif text-base text-facheiro-brown">{formatMoney(totalCents)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Frete</span>
              <strong className="font-serif text-base text-facheiro-brown">{formatMoney(shippingCents)}</strong>
            </div>
            <div className="flex justify-between border-t border-facheiro-linen pt-4 font-semibold">
              <span className="font-serif text-lg uppercase tracking-[0.05em] text-facheiro-brown">Total</span>
              <strong className="font-serif text-2xl text-facheiro-leather">{formatMoney(orderTotalCents)}</strong>
            </div>
          </div>
          {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
          <button
            className="focus-ring w-full bg-facheiro-brown px-5 py-4 font-serif text-base uppercase tracking-[0.18em] text-facheiro-off hover:bg-facheiro-leather transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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
