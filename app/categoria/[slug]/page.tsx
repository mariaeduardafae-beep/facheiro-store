import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Categoria",
    description: `Conheça as peças Facheiro em ${category?.name ?? "categoria"}.`
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, products] = await Promise.all([getCategoryBySlug(slug), getProducts({ categorySlug: slug })]);
  if (!category) notFound();

  const inStock = products.filter((product) => product.stock > 0).length;

  return (
    <main className="container-page py-10 md:py-16">
      <div className="mb-8 border-b border-facheiro-linen pb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-facheiro-black/60">Coleção</p>
        <h1 className="mt-2 font-serif text-6xl text-facheiro-brown md:text-8xl">{category.name}</h1>
        <div className="mt-6 flex gap-3 overflow-x-auto text-xs uppercase tracking-[0.14em] text-facheiro-black/70">
          <span className="border border-facheiro-linen px-3 py-2">{products.length} peças</span>
          <span className="border border-facheiro-linen px-3 py-2">{inStock} disponíveis</span>
        </div>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}