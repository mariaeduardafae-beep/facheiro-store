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
  console.log("CHECKOUT_ROUTE_EXECUTED");
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("CHECKOUT_ERROR_HERE", { reason: "Carrinho ou dados de entrega inválidos", errors: parsed.error.format(), requestBody: body });
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
    console.error("CHECKOUT_ERROR_HERE", { reason: "Produtos indisponíveis", productsError });
    return NextResponse.json({ error: "Produtos indisponíveis." }, { status: 400 });
  }

  const lines: Array<{ product: Product; quantity: number; total: number }> = [];
  for (const item of parsed.data.items) {
    const product = products.find((entry) => entry.id === item.product_id);
    if (!product || product.stock < item.quantity) {
      const errorMessage = `${product?.name ?? "Produto"} sem estoque suficiente.`;
      console.error("CHECKOUT_ERROR_HERE", { reason: "Sem estoque suficiente", productId: item.product_id, requested: item.quantity });
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    lines.push({
      product,
      quantity: item.quantity,
      total: product.price_cents * item.quantity
    });
  }

  const shippingQuote = {
    service: "fixed",
    name: "Frete fixo Melhor Envio",
    price: 29.9,
    price_cents: 2990,
    delivery_time: 7
  };
  const total_cents = lines.reduce((sum, line) => sum + line.total, 0) + shippingQuote.price_cents;
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "pendente",
      total_cents,
      customer_name: parsed.data.shipping.name,
      customer_email: parsed.data.shipping.email,
      shipping_address: parsed.data.shipping,
      shipping_quote: shippingQuote
    })
    .select()
    .single();

  if (orderError) {
    console.error("CHECKOUT_ERROR_HERE", { reason: "Falha ao criar pedido", orderError });
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      sku: line.product.sku,
      name: line.product.name,
      quantity: line.quantity,
      unit_price_cents: line.product.price_cents
    }))
  );

  if (itemsError) {
    console.error("CHECKOUT_ERROR_HERE", { reason: "Falha ao inserir itens do pedido", itemsError });
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 503 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const preference = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_reference: order.id,
      notification_url: `${siteUrl}/api/webhooks/mercado-pago`,
      back_urls: {
        success: `${siteUrl}/pedido/${order.id}?status=sucesso`,
        failure: `${siteUrl}/pedido/${order.id}?status=falha`,
        pending: `${siteUrl}/pedido/${order.id}?status=pendente`
      },
      auto_return: "approved",
      items: [
        ...lines.map((line) => ({
          id: line.product.sku,
          title: line.product.name,
          quantity: line.quantity,
          currency_id: "BRL",
          unit_price: line.product.price_cents / 100
        })),
        {
          id: "FRETE",
          title: "Frete fixo",
          quantity: 1,
          currency_id: "BRL",
          unit_price: shippingQuote.price_cents / 100
        }
      ]
    })
  });

  const payload = await preference.json();
  if (!preference.ok) {
    console.error("CHECKOUT_ERROR_HERE", { reason: "Mercado Pago retornou erro", status: preference.status, statusText: preference.statusText, body: payload, preferencePayload: null });
    return NextResponse.json({ error: payload.message ?? "Falha no Mercado Pago." }, { status: 400 });
  }

  await supabase.from("orders").update({ payment_reference: payload.id }).eq("id", order.id);

  return NextResponse.json({ order_id: order.id, init_point: payload.init_point });
}
