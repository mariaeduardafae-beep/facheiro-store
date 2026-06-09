import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const formData = await request.formData();
  const files = formData.getAll("images");
  if (!files.length) {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }

  const uploadedUrls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!(file instanceof File)) {
      errors.push("Arquivo inválido.");
      continue;
    }

    const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-.]/g, "_");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
    const path = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      errors.push(uploadError.message);
      continue;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    if (!data?.publicUrl) {
      errors.push(`Falha ao obter URL pública para ${file.name}.`);
      continue;
    }

    uploadedUrls.push(data.publicUrl);
  }

  return NextResponse.json({ urls: uploadedUrls, errors });
}
