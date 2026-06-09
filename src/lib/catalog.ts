import { demoCategories, demoProducts } from "@/lib/demo-data";
import { getPublicSupabase, getServiceSupabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";

function normalizeProduct(row: Product & { categories?: Category | null }): Product {
  return {
    ...row,
    category_slug: row.category_slug ?? row.categories?.slug,
    category_name: row.category_name ?? row.categories?.name,
    images: row.images?.length ? row.images : []
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return demoCategories;

  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) return demoCategories;
  if (!data?.length) return [];
  return data;
}

export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  bestSeller?: boolean;
  includeDrafts?: boolean;
}): Promise<Product[]> {
  const supabase = options?.includeDrafts ? getServiceSupabase() : getPublicSupabase();
  if (!supabase) return filterDemo(options);

  let query = supabase.from("products").select("*, categories(*)").order("created_at", { ascending: false });

  if (!options?.includeDrafts) query = query.eq("status", "active");
  if (options?.featured) query = query.eq("featured", true);
  if (options?.bestSeller) query = query.eq("best_seller", true);
  if (options?.categorySlug) {
    query = supabase
      .from("products")
      .select("*, categories!inner(*)")
      .eq("categories.slug", options.categorySlug)
      .order("created_at", { ascending: false });
    if (!options.includeDrafts) query = query.eq("status", "active");
    if (options.featured) query = query.eq("featured", true);
    if (options.bestSeller) query = query.eq("best_seller", true);
  }
  const { data, error } = await query;
  if (error) return filterDemo(options);
  const products = data?.map(normalizeProduct) ?? [];
  if (!options?.query) return products;

  const search = options.query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(search) ||
      product.category_name?.toLowerCase().includes(search) ||
      product.category_slug?.toLowerCase().includes(search)
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return demoProducts.find((product) => product.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return demoProducts.find((product) => product.slug === slug) ?? null;
  return normalizeProduct(data);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

function filterDemo(options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  bestSeller?: boolean;
  includeDrafts?: boolean;
}) {
  return demoProducts.filter((product) => {
    const categoryMatch = !options?.categorySlug || product.category_slug === options.categorySlug;
    const featuredMatch = !options?.featured || product.featured;
    const bestSellerMatch = !options?.bestSeller || product.best_seller;
    const search = options?.query?.toLowerCase();
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category_name?.toLowerCase().includes(search) ||
      product.category_slug?.toLowerCase().includes(search);
    return categoryMatch && featuredMatch && bestSellerMatch && searchMatch;
  });
}
