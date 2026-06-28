import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Token invalido." }, { status: 401 });
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
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase nao esta configurado para upload no ambiente. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
      },
      { status: 503 }
    );
  }

  try {
    try {
      await supabase.storage.createBucket("products", {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
      });
    } catch (bucketError) {
      console.log("Bucket creation status/error:", bucketError);
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("products").upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true
      });

      if (uploadError) {
        return NextResponse.json({ error: `Falha ao enviar imagem para o Supabase: ${uploadError.message}` }, { status: 500 });
      }

      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error("Error in upload api route:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor." }, { status: 500 });
  }
}