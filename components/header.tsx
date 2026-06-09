"use client";

import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/cart-provider";

const menu = [
  ["Colares", "/categoria/colares"],
  ["Pulseiras", "/categoria/pulseiras"],
  ["Brincos", "/categoria/brincos"],
  ["Acessórios", "/categoria/acessorios"]
];

export function Header() {
  const router = useRouter();
  const { openCart, count } = useCart();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-facheiro-linen bg-facheiro-off/95 backdrop-blur">
      <div className="container-page grid grid-cols-[1fr_auto_1fr] items-center py-3">
        <nav className="hidden items-center gap-7 md:flex">
          {menu.map(([label, href]) => (
            <Link key={href} href={href} className="focus-ring text-sm uppercase tracking-[0.14em] text-facheiro-black/75">
              {label}
            </Link>
          ))}
        </nav>
        <button className="focus-ring md:hidden" onClick={() => setSearchOpen((value) => !value)} aria-label="Abrir busca">
          <Search size={20} />
        </button>
        <Logo />
        <div className="flex justify-end gap-2">
          <button className="focus-ring hidden p-2 md:block" onClick={() => setSearchOpen((value) => !value)} aria-label="Abrir busca">
            <Search size={20} />
          </button>
          <button className="focus-ring relative p-2" onClick={openCart} aria-label="Abrir carrinho">
            <ShoppingBag size={21} />
            {count > 0 ? (
              <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-facheiro-brown px-1 text-[10px] text-facheiro-off">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <nav className="container-page flex gap-5 overflow-x-auto pb-3 md:hidden">
        {menu.map(([label, href]) => (
          <Link key={href} href={href} className="focus-ring shrink-0 text-xs uppercase tracking-[0.14em] text-facheiro-black/75">
            {label}
          </Link>
        ))}
      </nav>
      {searchOpen ? (
        <form onSubmit={submit} className="border-t border-facheiro-linen bg-facheiro-off">
          <div className="container-page flex items-center gap-3 py-3">
            <Search size={18} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por peça ou categoria"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </div>
        </form>
      ) : null}
    </header>
  );
}
