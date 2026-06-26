import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest, slugify } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalCategories, saveLocalCategories } from "@/lib/local-db";

const schema = z.object({
  name: z.string().min(2)
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nome de categoria inválido." }, { status: 400 });

  const categoryName = parsed.data.name;
  const categorySlug = slugify(categoryName);

  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from("categories").insert({
        name: categoryName,
        slug: categorySlug,
        sort_order: 99
      });
      if (!error) {
        return NextResponse.json({ categories: await getCategories() });
      }
      console.warn("Supabase insert category failed, falling back to local DB:", error.message);
    } catch (err: any) {
      console.warn("Supabase insert category crashed, falling back to local DB:", err.message);
    }
  }

  // Local DB Fallback
  try {
    const categories = getLocalCategories();
    const newCategory = {
      id: `cat-${Math.random().toString(36).substring(2, 11)}`,
      name: categoryName,
      slug: categorySlug,
      image_url: null,
      sort_order: 99
    };
    const updatedCategories = [...categories, newCategory];
    saveLocalCategories(updatedCategories);
    return NextResponse.json({ categories: updatedCategories });
  } catch (localErr: any) {
    return NextResponse.json({ error: `Erro ao criar categoria localmente: ${localErr.message}` }, { status: 500 });
  }
}
