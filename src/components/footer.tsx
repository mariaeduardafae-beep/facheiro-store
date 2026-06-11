import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-facheiro-linen py-10">
      <div className="container-page flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 text-sm md:flex-row md:gap-7">
          <Link href="/trocas-e-devolucoes" className="focus-ring font-serif text-sm uppercase tracking-[0.12em] text-facheiro-brown hover:text-facheiro-leather transition-colors duration-200">Trocas e devoluções</Link>
          <Link href="/politica-de-privacidade" className="focus-ring font-serif text-sm uppercase tracking-[0.12em] text-facheiro-brown hover:text-facheiro-leather transition-colors duration-200">Política de privacidade</Link>
          <Link href="/termos-de-uso" className="focus-ring font-serif text-sm uppercase tracking-[0.12em] text-facheiro-brown hover:text-facheiro-leather transition-colors duration-200">Termos de uso</Link>
        </div>
        <Link href="https://instagram.com" aria-label="Instagram" className="focus-ring w-fit">
          <Instagram size={22} />
        </Link>
      </div>
    </footer>
  );
}
