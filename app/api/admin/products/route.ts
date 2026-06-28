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

function supabaseConfigError() {
  return NextResponse.json(
    {
      error:
        "Supabase nao esta configurado para o painel admin. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  return upsertProduct(request);
}

export async function PUT(request: NextRequest) {
  return upsertProduct(request);
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token invalido." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Produto invalido." }, { status: 400 });

  const supabase = getServiceSupabase();
  if (!supabase) return supabaseConfigError();

  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: `Erro ao remover produto no Supabase: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
  } catch (err: any) {
    return NextResponse.json({ error: `Erro ao remover produto no Supabase: ${err.message}` }, { status: 500 });
  }
}

async function upsertProduct(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token invalido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos do produto." }, { status: 400 });

  const productData = {
    ...parsed.data,
    slug: parsed.data.slug || slugify(parsed.data.name)
  };

  const supabase = getServiceSupabase();
  if (!supabase) return supabaseConfigError();

  try {
    const { error } = await supabase.from("products").upsert(productData).select().single();
    if (error) {
      return NextResponse.json({ error: `Erro ao salvar produto no Supabase: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
  } catch (err: any) {
    return NextResponse.json({ error: `Erro ao salvar produto no Supabase: ${err.message}` }, { status: 500 });
  }
}