import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { isAdminRequest } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Falha ao ler as imagens enviadas." }, { status: 400 });
  }

  const files = formData.getAll("images") as File[];
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const urls: string[] = [];

  try {
    for (const file of files) {
      const supabaseUrl = supabase ? await uploadToSupabase(supabase, file) : null;
      if (supabaseUrl) {
        urls.push(supabaseUrl);
        continue;
      }

      urls.push(await saveLocalUpload(file));
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("Error in upload api route:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

async function uploadToSupabase(supabase: NonNullable<ReturnType<typeof getServiceSupabase>>, file: File) {
  try {
    await supabase.storage.createBucket("products", {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    });
  } catch (bucketError) {
    console.log("Bucket creation status/error:", bucketError);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true
      });

    if (uploadError) {
      console.warn("Supabase storage upload error, using local fallback:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.warn("Supabase upload crashed, using local fallback:", error);
    return null;
  }
}

async function saveLocalUpload(file: File) {
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const absolutePath = path.join(LOCAL_UPLOAD_DIR, fileName);

  await fs.writeFile(absolutePath, buffer);
  return `/uploads/products/${fileName}`;
}
