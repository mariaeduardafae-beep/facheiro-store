import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin";
import { getServiceSupabase } from "@/lib/supabase";

const schema = z.object({
  order_id: z.string(),
  service_id: z.number(),
  shipping_payload: z.record(z.unknown())
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados de etiqueta inválidos." }, { status: 400 });
  const supabase = getServiceSupabase();
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!supabase || !token) return NextResponse.json({ error: "Integração não configurada." }, { status: 503 });

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", parsed.data.order_id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.status !== "pago") return NextResponse.json({ error: "Apenas pedidos pagos podem gerar etiqueta." }, { status: 400 });

  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL ?? "https://www.melhorenvio.com.br/api/v2";
  const cartResponse = await fetch(`${baseUrl}/me/cart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Facheiro e-commerce"
    },
    body: JSON.stringify(parsed.data.shipping_payload)
  });
  const cartPayload = await cartResponse.json();
  if (!cartResponse.ok) {
    return NextResponse.json({ error: cartPayload.message ?? "Falha ao criar etiqueta no Melhor Envio." }, { status: 400 });
  }

  await supabase
    .from("orders")
    .update({
      shipping_quote: cartPayload,
      tracking_code: cartPayload?.tracking,
      status: "enviado"
    })
    .eq("id", order.id);

  return NextResponse.json({
    status: "created",
    order_id: order.id,
    service_id: parsed.data.service_id,
    melhor_envio: cartPayload
  });
}
