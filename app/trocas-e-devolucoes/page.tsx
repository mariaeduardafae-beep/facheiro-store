export default function ExchangesPage() {
  return <Policy title="Trocas e devoluções" />;
}

function Policy({ title }: { title: string }) {
  return (
    <main className="container-page max-w-3xl py-16">
      <h1 className="font-serif text-6xl text-facheiro-brown">{title}</h1>
      <p className="mt-6 leading-7 text-facheiro-black/70">
        Conteúdo institucional preparado para edição antes da publicação. Defina prazos, condições e canais oficiais da
        operação Facheiro.
      </p>
    </main>
  );
}
