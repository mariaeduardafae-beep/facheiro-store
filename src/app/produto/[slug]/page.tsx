import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGrid } from "@/components/product-grid";
import { formatMoney, installments } from "@/lib/format";
import { fallbackProductImage } from "@/lib/images";
import { getProductBySlug, getProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Produto",
    description: product?.description
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ categorySlug: product.category_slug })).filter((item) => item.id !== product.id).slice(0, 4);
  const soldOut = product.stock <= 0;
  const images = product.images.length ? product.images : [fallbackProductImage];

  return (
    <main className="container-page py-8 md:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <div className="grid gap-3 md:grid-cols-2">
          {images.map((image, index) => (
            <div key={image} className="relative aspect-[4/5] overflow-hidden bg-facheiro-linen">
              <Image
                src={image}
                alt={`${product.name} imagem ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-serif text-sm uppercase tracking-[0.18em] text-facheiro-black/55">{product.category_name}</p>
          <h1 className="mt-2 font-serif text-6xl leading-none text-facheiro-brown">{product.name}</h1>
          <p className="mt-6 font-serif text-3xl tracking-[0.05em] text-facheiro-leather">{formatMoney(product.price_cents)}</p>
          <p className="mt-1 text-sm text-facheiro-black/60">{installments(product.price_cents)}</p>
          <p className="mt-7 leading-7 text-facheiro-black/75">{product.description}</p>
          <div className="mt-7">
            {soldOut ? <p className="mb-3 text-sm text-facheiro-black/60">Peça esgotada no momento.</p> : null}
            <AddToCartButton product={product} />
          </div>
          <div className="mt-8 border-t border-facheiro-linen pt-5 font-serif text-sm uppercase tracking-[0.08em] leading-7 text-facheiro-black/65">
            <p>SKU: <span className="font-sans normal-case text-facheiro-black/80">{product.sku}</span></p>
            <p>Estoque: <span className="font-sans normal-case text-facheiro-black/80">{soldOut ? "esgotado" : `${product.stock} disponível(is)`}</span></p>
          </div>
        </aside>
      </section>

      <section className="py-14 md:py-20">
        <h2 className="mb-7 font-serif text-5xl text-facheiro-brown">Produtos relacionados</h2>
        <ProductGrid products={related} />
      </section>
    </main>
  );
}
