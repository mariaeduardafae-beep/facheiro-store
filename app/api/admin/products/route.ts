import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest, slugify } from "@/lib/admin";
import { getProducts } from "@/lib/catalog";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
  category_id: z.string().min(1),
  description: z.string().min(1),
  price_cents: z.number().int().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  featured: z.boolean().default(false),
  best_seller: z.boolean().default(false),
  status: z.enum(["active", "draft", "archived"]).default("active")
});

export async function POST(request: NextRequest) {
  return upsertProduct(request);
}

export async function PUT(request: NextRequest) {
  return upsertProduct(request);
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
}

async function upsertProduct(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos do produto." }, { status: 400 });

  const product = {
    ...parsed.data,
    slug: parsed.data.slug || slugify(parsed.data.name)
  };
  const { error } = await supabase.from("products").upsert(product).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
}
