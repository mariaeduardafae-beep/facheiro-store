import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest, slugify } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2)
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token invalido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nome de categoria invalido." }, { status: 400 });

  const categoryName = parsed.data.name;
  const categorySlug = slugify(categoryName);

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase nao esta configurado para o painel admin. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
      },
      { status: 503 }
    );
  }

  try {
    const { error } = await supabase.from("categories").insert({
      name: categoryName,
      slug: categorySlug,
      sort_order: 99
    });
    if (error) {
      return NextResponse.json({ error: `Erro ao criar categoria no Supabase: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ categories: await getCategories() });
  } catch (err: any) {
    return NextResponse.json({ error: `Erro ao criar categoria no Supabase: ${err.message}` }, { status: 500 });
  }
}