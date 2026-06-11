import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

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
      <div className="mb-8 bg-facheiro-pattern-light border border-facheiro-linen/60 rounded-xl p-6 md:p-10">
        <p className="font-serif text-sm uppercase tracking-[0.18em] text-facheiro-black/60">Coleção</p>
        <h1 className="mt-2 font-serif text-6xl text-facheiro-brown md:text-8xl">{category.name}</h1>
        <div className="mt-6 flex gap-3 overflow-x-auto text-xs uppercase tracking-[0.14em] text-facheiro-black/70">
          <span className="bg-white/85 backdrop-blur border border-facheiro-linen/50 px-3 py-2 rounded">{products.length} peças</span>
          <span className="bg-white/85 backdrop-blur border border-facheiro-linen/50 px-3 py-2 rounded">{inStock} disponíveis</span>
        </div>
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
