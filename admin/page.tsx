import { AdminCatalog } from "@/components/admin-catalog";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata = {
  title: "Administração"
};

export default async function AdminPage() {
  const [products, categories] = await Promise.all([getProducts({ includeDrafts: true }), getCategories()]);

  return (
    <main className="container-page py-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-facheiro-black/55">Facheiro</p>
        <h1 className="mt-2 font-serif text-6xl text-facheiro-brown">Administração</h1>
      </div>
      <AdminCatalog initialProducts={products} initialCategories={categories} />
    </main>
  );
}
