import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque peças Facheiro por nome ou categoria."
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await getProducts({ query: q });

  return (
    <main className="container-page py-10 md:py-16">
      <div className="mb-8 border-b border-facheiro-linen pb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-facheiro-black/60">Busca</p>
        <h1 className="mt-2 font-serif text-6xl text-facheiro-brown md:text-8xl">
          {q ? `Resultados para "${q}"` : "Todas as peças"}
        </h1>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}