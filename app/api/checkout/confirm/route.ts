import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  items: z.array(
    z.object({
      product_id: z.string(),
      sku: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      unit_price_cents: z.number().int().positive(),
      total_cents: z.number().int().nonnegative()
    })
  ),
  shipping: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    postal_code: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string()
  }),
  shipping_quote: z.object({
    service: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
    price_cents: z.number().int().nonnegative(),
    delivery_time: z.number()
  }),
  subtotal_cents: z.number().int().nonnegative(),
  shipping_cents: z.number().int().nonnegative(),
  total_cents: z.number().int().positive()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error("CONFIRM_ERROR", { error: parsed.error.format() });
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pendente",
        total_cents: parsed.data.total_cents,
        customer_name: parsed.data.shipping.name,
        customer_email: parsed.data.shipping.email,
        shipping_address: parsed.data.shipping,
        shipping_quote: parsed.data.shipping_quote
      })
      .select()
      .single();

    if (orderError) {
      console.error("CONFIRM_ERROR", { error: orderError });
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      parsed.data.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents
      }))
    );

    if (itemsError) {
      console.error("CONFIRM_ERROR", { error: itemsError });
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
          ...parsed.data.items.map((item) => ({
            id: item.sku,
            title: item.name,
            quantity: item.quantity,
            currency_id: "BRL",
            unit_price: item.unit_price_cents / 100
          })),
          {
            id: "FRETE",
            title: parsed.data.shipping_quote.name,
            quantity: 1,
            currency_id: "BRL",
            unit_price: parsed.data.shipping_cents / 100
          }
        ]
      })
    });

    const payload = await preference.json();
    if (!preference.ok) {
      console.error("CONFIRM_ERROR", { reason: "Mercado Pago error", status: preference.status, body: payload });
      return NextResponse.json({ error: payload.message ?? "Falha no Mercado Pago." }, { status: 400 });
    }

    await supabase.from("orders").update({ payment_reference: payload.id }).eq("id", order.id);

    return NextResponse.json({ order_id: order.id, init_point: payload.init_point });
  } catch (error) {
    console.error("CONFIRM_ERROR", error);
    return NextResponse.json({ error: "Erro ao confirmar pedido." }, { status: 500 });
  }
}
