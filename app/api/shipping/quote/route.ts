import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  toPostalCode: z.string().min(8),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
      price_cents: z.number().int().positive()
    })
  )
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados de frete inválidos." }, { status: 400 });

  const token = process.env.MELHOR_ENVIO_ACCESS_TOKEN ?? process.env.MELHOR_ENVIO_TOKEN;
  if (!token) return NextResponse.json({ error: "Melhor Envio não configurado." }, { status: 503 });

  const storePostalCode = process.env.STORE_POSTAL_CODE;
  if (!storePostalCode) return NextResponse.json({ error: "CEP da loja não configurado." }, { status: 503 });

  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL ?? "https://sandbox.melhorenvio.com.br/api/v2";
  const response = await fetch(`${baseUrl}/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT ?? "Facheiro Store (suporte@facheiro.com.br)"
    },
    body: JSON.stringify({
      from: { postal_code: storePostalCode },
      to: { postal_code: parsed.data.toPostalCode.replace(/\D/g, "") },
      products: parsed.data.items.map((item) => ({
        id: item.id,
        width: 12,
        height: 4,
        length: 16,
        weight: 0.2,
        insurance_value: item.price_cents / 100,
        quantity: item.quantity
      })),
      options: {
        receipt: false,
        own_hand: false
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) return NextResponse.json({ error: payload.message ?? "Falha ao calcular frete." }, { status: 400 });
  return NextResponse.json({ quotes: payload.data ?? payload });
}
