import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest, slugify } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2)
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nome de categoria inválido." }, { status: 400 });

  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    sort_order: 99
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ categories: await getCategories() });
}
