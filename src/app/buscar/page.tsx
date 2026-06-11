import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque peças Facheiro por nome ou categoria."
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await getProducts({ query: q });

  return (
    <main className="container-page py-10 md:py-16">
      <div className="mb-8 bg-facheiro-pattern-light border border-facheiro-linen/60 rounded-xl p-6 md:p-10">
        <p className="font-serif text-sm uppercase tracking-[0.18em] text-facheiro-black/60">Busca</p>
        <h1 className="mt-2 font-serif text-6xl text-facheiro-brown md:text-8xl">
          {q ? `Resultados para "${q}"` : "Todas as peças"}
        </h1>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
