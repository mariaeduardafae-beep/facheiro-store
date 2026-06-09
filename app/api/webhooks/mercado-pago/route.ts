import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = getServiceSupabase();
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!supabase || !token) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await request.json();
  const paymentId = body?.data?.id ?? request.nextUrl.searchParams.get("id");
  if (!paymentId) return NextResponse.json({ ok: true });

  const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await payment.json();
  if (!payment.ok) return NextResponse.json({ ok: false }, { status: 400 });

  const orderId = payload.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  if (payload.status === "approved") {
    await supabase.rpc("mark_order_paid_and_decrement_stock", { target_order_id: orderId });
  } else if (["cancelled", "rejected", "refunded", "charged_back"].includes(payload.status)) {
    await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
  }

  return NextResponse.json({ ok: true });
}
