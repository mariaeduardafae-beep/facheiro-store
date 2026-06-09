import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin";

const schema = z.object({
  tracking_codes: z.array(z.string()).min(1)
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Código de rastreio inválido." }, { status: 400 });

  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) return NextResponse.json({ error: "Melhor Envio não configurado." }, { status: 503 });

  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL ?? "https://www.melhorenvio.com.br/api/v2";
  const response = await fetch(`${baseUrl}/me/shipment/tracking`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Facheiro e-commerce"
    },
    body: JSON.stringify({ orders: parsed.data.tracking_codes })
  });

  const payload = await response.json();
  if (!response.ok) return NextResponse.json({ error: payload.message ?? "Falha ao rastrear pedido." }, { status: 400 });
  return NextResponse.json({ tracking: payload });
}
