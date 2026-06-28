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

function supabaseMissingError(context: string): never {
  throw new Error(`Supabase indisponivel em ${context}. Verifique as variaveis de ambiente e a conexao.`);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getPublicSupabase();
  if (!supabase) supabaseMissingError("getCategories");

  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) {
    throw new Error(`Erro ao carregar categorias do Supabase: ${error.message}`);
  }
  return data ?? [];
}

export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  bestSeller?: boolean;
  includeDrafts?: boolean;
}): Promise<Product[]> {
  const supabase = options?.includeDrafts ? getServiceSupabase() : getPublicSupabase();
  if (!supabase) supabaseMissingError("getProducts");
  const client = supabase;

  let query = client.from("products").select("*, categories(*)").order("created_at", { ascending: false });

  if (!options?.includeDrafts) query = query.eq("status", "active");
  if (options?.featured) query = query.eq("featured", true);
  if (options?.bestSeller) query = query.eq("best_seller", true);
  if (options?.categorySlug) {
    query = client
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
    throw new Error(`Erro ao carregar produtos do Supabase: ${error.message}`);
  }

  return data?.map(normalizeProduct) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicSupabase();
  if (!supabase) supabaseMissingError("getProductBySlug");
  const client = supabase;

  const { data, error } = await client
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") return null;
    throw new Error(`Erro ao carregar produto do Supabase: ${error?.message ?? "produto nao encontrado"}`);
  }

  return normalizeProduct(data);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}