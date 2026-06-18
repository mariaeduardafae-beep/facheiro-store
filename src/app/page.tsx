import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export default async function Home() {
  const [categories, featured, bestSellers] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getProducts({ bestSeller: true })
  ]);

  return (
    <main>
      <section className="relative min-h-[78svh] overflow-hidden">
        <Image
          src="/hero-facheiro.jpg"
          alt="Peça Facheiro em fotografia editorial com luz natural"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-facheiro-black/45 via-facheiro-black/10 to-transparent" />
        <div className="container-page relative flex min-h-[78svh] items-end pb-16">
          <div className="max-w-xl text-facheiro-off">
            <h1 className="font-serif text-6xl leading-[0.95] md:text-8xl">para permanecer.</h1>
            <p className="mt-5 max-w-md text-base leading-7 md:text-lg">
              Peças criadas para atravessar tendências e fazer parte da sua história.
            </p>
            <Link
              href="/categoria/colares"
              className="focus-ring mt-8 inline-flex bg-facheiro-off px-6 py-4 text-xs uppercase tracking-[0.18em] text-facheiro-brown"
            >
              Conhecer coleção
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categoria/${category.slug}`} className="focus-ring group">
              <div className="relative aspect-[3/4] overflow-hidden bg-facheiro-linen">
                <Image
                  src={category.image_url ?? "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=85"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <h2 className="mt-3 font-serif text-3xl text-facheiro-brown">{category.name}</h2>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative min-h-[58svh] overflow-hidden">
        <Image
          src="/autoral-foto.jpg"
          alt="Textura clara em composição editorial"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-facheiro-black/25" />
        <div className="container-page relative flex min-h-[58svh] items-center">
          <h2 className="max-w-2xl font-display text-6xl leading-[0.95] text-facheiro-off md:text-8xl">
            Autoral em cada detalhe.
          </h2>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-5">
          <h2 className="font-serif text-5xl text-facheiro-brown">Produtos em destaque</h2>
          <Link href="/buscar" className="hidden text-xs uppercase tracking-[0.16em] md:inline">Ver todos</Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="bg-facheiro-brown bg-facheiro-pattern-dark py-16 text-facheiro-off md:py-24">
        <div className="container-page">
          <h2 className="max-w-4xl font-serif text-6xl leading-[0.95] md:text-8xl">
            Criadas para serem usadas. Feitas para durar.
          </h2>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-5">
          <h2 className="font-serif text-5xl text-facheiro-brown">Mais vendidos</h2>
          <Link href="/buscar" className="hidden text-xs uppercase tracking-[0.16em] md:inline">Ver todos</Link>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

    </main>
  );
}
