import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

const schema = z.object({
  items: z.array(z.object({ product_id: z.string(), quantity: z.number().int().positive() })).min(1),
  shipping: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    postal_code: z.string().min(1),
    street: z.string().min(1),
    number: z.string().min(1),
    complement: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1)
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Carrinho ou dados de entrega inválidos." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });

    const productIds = parsed.data.items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("status", "active");

    if (productsError || !products?.length) {
      return NextResponse.json({ error: "Produtos indisponíveis." }, { status: 400 });
    }

    const lines: Array<{ product: Product; quantity: number; total: number }> = [];
    for (const item of parsed.data.items) {
      const product = products.find((entry) => entry.id === item.product_id);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product?.name ?? "Produto"} sem estoque suficiente.` },
          { status: 400 }
        );
      }
      lines.push({
        product,
        quantity: item.quantity,
        total: product.price_cents * item.quantity
      });
    }

    const shippingQuote = {
      service: "fixed",
      name: "Frete fixo",
      price: 29.9,
      price_cents: 2990,
      delivery_time: 7
    };

    const orderData = {
      items: lines.map((line) => ({
        product_id: line.product.id,
        sku: line.product.sku,
        name: line.product.name,
        quantity: line.quantity,
        unit_price_cents: line.product.price_cents,
        total_cents: line.total
      })),
      shipping: parsed.data.shipping,
      shipping_quote: shippingQuote,
      subtotal_cents: lines.reduce((sum, line) => sum + line.total, 0),
      shipping_cents: shippingQuote.price_cents,
      total_cents: lines.reduce((sum, line) => sum + line.total, 0) + shippingQuote.price_cents
    };

    // Armazenar temporariamente em sessão (será limpo após pagamento)
    // Por agora, vamos passar tudo no JSON como resposta
    return NextResponse.json({
      review_id: Math.random().toString(36).substring(2, 11),
      order_data: orderData
    });
  } catch (error) {
    console.error("REVIEW_ERROR", error);
    return NextResponse.json({ error: "Erro ao processar pedido." }, { status: 500 });
  }
}
