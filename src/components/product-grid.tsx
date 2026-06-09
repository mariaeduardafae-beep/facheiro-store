import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="py-16 text-center text-sm text-facheiro-black/65">Nenhuma peça encontrada.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
