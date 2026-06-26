import { getLocalProducts, getLocalCategories } from "@/lib/local-db";
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
  if (!supabase) return getLocalCategories();

  try {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) {
      console.warn("Supabase error getting categories, falling back to local DB:", error.message);
      return getLocalCategories();
    }
    if (!data?.length) return [];
    return data;
  } catch (err: any) {
    console.warn("Supabase offline, falling back to local DB:", err.message);
    return getLocalCategories();
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  bestSeller?: boolean;
  includeDrafts?: boolean;
}): Promise<Product[]> {
  const supabase = options?.includeDrafts ? getServiceSupabase() : getPublicSupabase();
  if (!supabase) return filterLocal(options);

  try {
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
    if (error) {
      console.warn("Supabase error getting products, falling back to local DB:", error.message);
      return filterLocal(options);
    }
    return data?.map(normalizeProduct) ?? [];
  } catch (err: any) {
    console.warn("Supabase offline, falling back to local DB:", err.message);
    return filterLocal(options);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return getLocalProducts().find((product) => product.slug === slug && product.status === "active") ?? null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return getLocalProducts().find((product) => product.slug === slug && product.status === "active") ?? null;
    }
    return normalizeProduct(data);
  } catch (err: any) {
    return getLocalProducts().find((product) => product.slug === slug && product.status === "active") ?? null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

function filterLocal(options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  bestSeller?: boolean;
  includeDrafts?: boolean;
}) {
  const products = getLocalProducts();
  return products.filter((product) => {
    const statusMatch = options?.includeDrafts || product.status === "active";
    const categoryMatch = !options?.categorySlug || product.category_slug === options.categorySlug || product.category_id === options.categorySlug;
    const featuredMatch = !options?.featured || product.featured;
    const bestSellerMatch = !options?.bestSeller || product.best_seller;
    const search = options?.query?.toLowerCase();
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category_name?.toLowerCase().includes(search) ||
      product.category_slug?.toLowerCase().includes(search);
    return statusMatch && categoryMatch && featuredMatch && bestSellerMatch && searchMatch;
  });
}
