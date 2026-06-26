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

  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    // Ensure the 'products' bucket exists and is public
    // We try to create it, ignoring the error if it already exists.
    try {
      await supabase.storage.createBucket("products", {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
      });
    } catch (bucketError) {
      // Bucket might already exist or creation failed, we will proceed to upload anyway
      console.log("Bucket creation status/error:", bucketError);
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a unique file name
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return NextResponse.json(
          { error: `Falha ao fazer upload da imagem: ${uploadError.message}` },
          { status: 400 }
        );
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      urls.push(publicUrl);
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
