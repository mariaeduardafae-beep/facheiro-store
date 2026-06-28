import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { isAdminRequest, slugify } from "@/lib/admin";
import { getProducts } from "@/lib/catalog";
import { getServiceSupabase } from "@/lib/supabase";
import { getLocalProducts, saveLocalProducts, getLocalCategories } from "@/lib/local-db";
import type { Product } from "@/lib/types";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

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
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });

  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
      }
      console.warn("Supabase delete failed, falling back to local DB:", error.message);
    } catch (err: any) {
      console.warn("Supabase delete request crashed, falling back to local DB:", err.message);
    }
  }

  try {
    const products = getLocalProducts();
    const productToDelete = products.find((product) => product.id === id);
    await removeLocalProductImages(productToDelete?.images ?? []);

    const updatedProducts = products.filter((product) => product.id !== id);
    saveLocalProducts(updatedProducts);
    return NextResponse.json({ products: updatedProducts });
  } catch (localErr: any) {
    return NextResponse.json({ error: `Erro ao remover localmente: ${localErr.message}` }, { status: 500 });
  }
}

async function upsertProduct(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revise os campos do produto." }, { status: 400 });

  const productData = {
    ...parsed.data,
    slug: parsed.data.slug || slugify(parsed.data.name)
  };

  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from("products").upsert(productData).select().single();
      if (!error) {
        return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
      }
      console.warn("Supabase upsert failed, falling back to local DB:", error.message);
    } catch (err: any) {
      console.warn("Supabase upsert request crashed, falling back to local DB:", err.message);
    }
  }

  try {
    const products = getLocalProducts();
    const categories = getLocalCategories();
    const cat = categories.find((category) => category.id === productData.category_id);

    const fullProduct: Product = {
      id: productData.id || `prod-${Math.random().toString(36).substring(2, 11)}`,
      sku: productData.sku,
      name: productData.name,
      slug: productData.slug,
      category_id: productData.category_id,
      category_slug: cat?.slug || "sem-categoria",
      category_name: cat?.name || "Sem Categoria",
      description: productData.description,
      price_cents: productData.price_cents,
      stock: productData.stock,
      images: productData.images,
      featured: productData.featured,
      best_seller: productData.best_seller,
      status: productData.status as Product["status"]
    };

    let updatedProducts: Product[];
    if (productData.id) {
      updatedProducts = products.map((product) => (product.id === productData.id ? fullProduct : product));
      if (!updatedProducts.some((product) => product.id === productData.id)) {
        updatedProducts.push(fullProduct);
      }
    } else {
      updatedProducts = [...products, fullProduct];
    }

    saveLocalProducts(updatedProducts);
    return NextResponse.json({ products: updatedProducts });
  } catch (localErr: any) {
    return NextResponse.json({ error: `Erro ao salvar localmente: ${localErr.message}` }, { status: 500 });
  }
}

async function removeLocalProductImages(images: string[]) {
  const localImages = images.filter((image) => image.startsWith("/uploads/products/"));
  if (localImages.length === 0) return;

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  await Promise.all(
    localImages.map(async (image) => {
      const fileName = image.split("/").pop();
      if (!fileName) return;

      try {
        await fs.unlink(path.join(LOCAL_UPLOAD_DIR, fileName));
      } catch (error) {
        console.warn("Não foi possível remover a imagem local do produto:", error);
      }
    })
  );
}
