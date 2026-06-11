"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { fallbackProductImage } from "@/lib/images";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/cart-provider";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = product.stock <= 0;
  const image = product.images[0] ?? fallbackProductImage;

  return (
    <article className="group">
      <Link href={`/produto/${product.slug}`} className="focus-ring block">
        <div className="relative aspect-[4/5] overflow-hidden bg-facheiro-linen">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
          {soldOut ? (
            <span className="absolute left-3 top-3 bg-facheiro-off px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
              Esgotado
            </span>
          ) : null}
        </div>
        <div className="mt-3">
          <p className="font-serif text-2xl leading-tight text-facheiro-brown">{product.name}</p>
          <p className="mt-1 font-serif text-xl tracking-[0.05em] text-facheiro-leather">{formatMoney(product.price_cents)}</p>
        </div>
      </Link>
      <button
        className="focus-ring mt-3 w-full border border-facheiro-brown px-3 py-3 font-serif text-sm uppercase tracking-[0.18em] text-facheiro-brown transition-colors hover:bg-facheiro-brown hover:text-facheiro-off disabled:border-facheiro-black/25 disabled:text-facheiro-black/40"
        disabled={soldOut}
        onClick={() => addItem(product)}
      >
        {soldOut ? "Indisponível" : "Comprar"}
      </button>
    </article>
  );
}
