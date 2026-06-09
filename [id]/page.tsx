import { getServiceSupabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/format";

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const supabase = getServiceSupabase();
  const { data: order } = supabase
    ? await supabase.from("orders").select("*, order_items(*)").eq("id", id).single()
    : { data: null };

  return (
    <main className="container-page max-w-3xl py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-facheiro-black/55">Pedido</p>
      <h1 className="mt-2 font-serif text-6xl text-facheiro-brown">
        {status === "sucesso" ? "Compra recebida." : "Acompanhe seu pedido."}
      </h1>
      <p className="mt-6 leading-7 text-facheiro-black/70">
        Pedido {id}. {order ? `Status: ${order.status}. Total: ${formatMoney(order.total_cents)}.` : "Assim que o pagamento for confirmado, o pedido será atualizado."}
      </p>
    </main>
  );
}
