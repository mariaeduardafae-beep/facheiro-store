"use client";

import { FormEvent, useMemo, useState, useRef } from "react";
import type { Category, Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";

type ProductForm = {
  id?: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  description: string;
  price_cents: string;
  stock: string;
  images: string;
  featured: boolean;
  best_seller: boolean;
  status: Product["status"];
};

const emptyForm: ProductForm = {
  sku: "",
  name: "",
  slug: "",
  category_id: "",
  description: "",
  price_cents: "",
  stock: "0",
  images: "",
  featured: false,
  best_seller: false,
  status: "active"
};

export function AdminCatalog({
  initialProducts,
  initialCategories
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm, category_id: initialCategories[0]?.id ?? "" });
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

  function edit(product: Product) {
    setForm({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      description: product.description,
      price_cents: String(product.price_cents),
      stock: String(product.stock),
      images: product.images.join("\n"),
      featured: product.featured,
      best_seller: product.best_seller,
      status: product.status
    });
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/admin/products", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          ...form,
          price_cents: Number(form.price_cents),
          stock: Number(form.stock),
          images: form.images.split(/\n|,/).map((image) => image.trim()).filter(Boolean)
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível salvar.");
        return;
      }
      setProducts(payload.products);
      setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
      setMessage("Produto salvo com sucesso.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro ao salvar produto: ${err.message || err}`);
    }
  }

  async function removeProduct(productId: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token }
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível remover.");
        return;
      }
      setProducts(payload.products);
      setMessage("Produto removido com sucesso.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro ao remover produto: ${err.message || err}`);
    }
  }

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ name: categoryName })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível criar categoria.");
        return;
      }
      setCategories(payload.categories);
      setCategoryName("");
      setMessage("Categoria criada com sucesso.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro ao criar categoria: ${err.message || err}`);
    }
  }

  async function toggleProductStatus(product: Product) {
    setMessage("");
    try {
      const newStatus: Product["status"] = product.status === "active" ? "draft" : "active";
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          category_id: product.category_id,
          description: product.description,
          price_cents: product.price_cents,
          stock: product.stock,
          images: product.images,
          featured: product.featured,
          best_seller: product.best_seller,
          status: newStatus
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível alterar o status.");
        return;
      }
      setProducts(payload.products);
      setMessage(`Produto "${product.name}" ${newStatus === "active" ? "ativado" : "desativado"} com sucesso.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro ao alterar status: ${err.message || err}`);
    }
  }

  async function updateStock(product: Product, newStock: number) {
    if (newStock < 0) return;
    setMessage("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          category_id: product.category_id,
          description: product.description,
          price_cents: product.price_cents,
          stock: newStock,
          images: product.images,
          featured: product.featured,
          best_seller: product.best_seller,
          status: product.status
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível atualizar o estoque.");
        return;
      }
      setProducts(payload.products);
      setMessage(`Estoque de "${product.name}" atualizado para ${newStock}.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro ao atualizar estoque: ${err.message || err}`);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section className="border border-facheiro-linen p-4">
        <label className="block text-xs uppercase tracking-[0.16em] text-facheiro-black/60">Token de administração</label>
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          type="password"
          className="mt-2 w-full border border-facheiro-linen bg-transparent px-3 py-3 outline-none"
          placeholder="Definido no ambiente"
        />
        <p className="mt-2 text-xs text-facheiro-black/55">Use o valor de <code>FACHEIRO_ADMIN_TOKEN</code> de <code>.env.local</code>.</p>
        {message ? <p className="mt-3 text-sm text-facheiro-brown">{message}</p> : null}

        <form onSubmit={addCategory} className="mt-8 border-t border-facheiro-linen pt-6">
          <label className="block text-xs uppercase tracking-[0.16em] text-facheiro-black/60">Nova categoria</label>
          <div className="mt-2 flex gap-2">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="min-w-0 flex-1 border border-facheiro-linen bg-transparent px-3 py-3 outline-none"
            />
            <button className="bg-facheiro-brown px-4 text-xs uppercase tracking-[0.14em] text-facheiro-off">Criar</button>
          </div>
        </form>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
        <form onSubmit={saveProduct} className="border border-facheiro-linen p-4">
          <h2 className="font-serif text-4xl text-facheiro-brown">{form.id ? "Editar produto" : "Novo produto"}</h2>
          <div className="mt-5 grid gap-3">
            <Input label="SKU" value={form.sku} onChange={(sku) => setForm({ ...form, sku })} />
            <Input label="Nome" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Input label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
            <label className="text-sm">
              Categoria
              <select
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                className="mt-1 w-full border border-facheiro-linen bg-facheiro-off px-3 py-3"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-1 min-h-28 w-full border border-facheiro-linen bg-transparent px-3 py-3 outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço em centavos" value={form.price_cents} onChange={(price_cents) => setForm({ ...form, price_cents })} />
              <Input label="Estoque" value={form.stock} onChange={(stock) => setForm({ ...form, stock })} />
            </div>
            <label className="text-sm">
              Imagens, uma URL por linha
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-facheiro-brown px-4 py-2 text-xs uppercase tracking-[0.14em] text-facheiro-off"
                >
                  Selecionar imagens
                </button>
                {uploading ? <span className="text-sm">Enviando...</span> : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={async (event) => {
                  const files = event.target.files;
                  if (!files || files.length === 0) return;
                  setMessage("");
                  setUploading(true);

                  const formData = new FormData();
                  Array.from(files).forEach((file) => formData.append("images", file));

                  const response = await fetch("/api/admin/uploads", {
                    method: "POST",
                    headers: { "x-admin-token": token },
                    body: formData
                  });

                  const payload = await response.json();
                  setUploading(false);

                  if (!response.ok) {
                    setMessage(payload.error ?? "Erro ao enviar as imagens.");
                    return;
                  }

                  if (Array.isArray(payload.urls) && payload.urls.length > 0) {
                    setForm({ ...form, images: [form.images, ...payload.urls].filter(Boolean).join("\n") });
                    setMessage("Imagens enviadas com sucesso.");
                  }

                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />
              <textarea
                value={form.images}
                onChange={(event) => setForm({ ...form, images: event.target.value })}
                className="mt-1 min-h-24 w-full border border-facheiro-linen bg-transparent px-3 py-3 outline-none"
              />
              <div className="mt-2 grid grid-cols-3 gap-2">
                {form.images.split(/\n|,/).map((src) => src.trim()).filter(Boolean).map((src) => (
                  <img key={src} src={src} alt="preview" className="h-24 w-full object-cover" />
                ))}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Destaque</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.best_seller} onChange={(event) => setForm({ ...form, best_seller: event.target.checked })} /> Mais vendido</label>
            </div>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as Product["status"] })}
              className="border border-facheiro-linen bg-facheiro-off px-3 py-3 text-sm"
            >
              <option value="active">Ativo</option>
              <option value="draft">Rascunho</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <button className="mt-5 w-full bg-facheiro-brown px-4 py-4 text-xs uppercase tracking-[0.16em] text-facheiro-off">
            Salvar produto
          </button>
        </form>

        <div className="space-y-3">
          {sortedProducts.map((product) => (
            <article key={product.id} className="border border-facheiro-linen p-4 bg-facheiro-off/30 hover:bg-facheiro-off/60 transition-colors duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-3xl text-facheiro-brown">{product.name}</h3>
                  <p className="text-sm text-facheiro-black/65">{product.sku} · {formatMoney(product.price_cents)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.status === "active" ? "bg-emerald-600" : "bg-facheiro-linen"}`} />
                  <span className="text-xs uppercase tracking-[0.14em] text-facheiro-black/55">
                    {product.status === "active" ? "Ativo" : product.status === "draft" ? "Rascunho" : "Arquivado"}
                  </span>
                </div>
              </div>

              {/* Quick stock editor */}
              <div className="mt-4 flex items-center gap-3 border-t border-facheiro-linen/30 pt-3">
                <span className="text-xs uppercase tracking-[0.14em] text-facheiro-black/55">Estoque Rápido:</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => updateStock(product, product.stock - 1)}
                    disabled={product.stock <= 0}
                    className="flex h-8 w-8 items-center justify-center border border-facheiro-linen bg-transparent hover:bg-facheiro-linen/20 text-facheiro-brown font-bold disabled:opacity-40 select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0) {
                        updateStock(product, val);
                      }
                    }}
                    className="h-8 w-14 border-y border-facheiro-linen bg-transparent text-center text-sm outline-none [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:margin-0 [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateStock(product, product.stock + 1)}
                    className="flex h-8 w-8 items-center justify-center border border-facheiro-linen bg-transparent hover:bg-facheiro-linen/20 text-facheiro-brown font-bold select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-facheiro-linen/30 pt-3">
                <button
                  type="button"
                  onClick={() => edit(product)}
                  className="border border-facheiro-brown px-4 py-2 text-xs uppercase tracking-[0.14em] text-facheiro-brown hover:bg-facheiro-brown hover:text-facheiro-off transition-all duration-300"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleProductStatus(product)}
                  className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all duration-300 ${
                    product.status === "active"
                      ? "border-facheiro-linen text-facheiro-black/70 hover:bg-facheiro-linen/10"
                      : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {product.status === "active" ? "Desativar" : "Ativar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover permanentemente o produto "${product.name}"?`)) {
                      removeProduct(product.id);
                    }
                  }}
                  className="border border-red-200 px-4 py-2 text-xs uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 transition-all duration-300 ml-auto"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-facheiro-linen bg-transparent px-3 py-3 outline-none"
      />
    </label>
  );
}
