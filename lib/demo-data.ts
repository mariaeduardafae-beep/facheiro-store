import type { Category, Product } from "@/lib/types";

const editorial = "/categoria-acessorios.png";
const linen = "/hero-facheiro.jpg";
const stone = "/categoria-pulseiras.png";
const wood = "/categoria-brincos.png";
const light = "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1400&q=85";

export const demoCategories: Category[] = [
  { id: "cat-colares", name: "Colares", slug: "colares", image_url: linen, sort_order: 1 },
  { id: "cat-pulseiras", name: "Pulseiras", slug: "pulseiras", image_url: stone, sort_order: 2 },
  { id: "cat-brincos", name: "Brincos", slug: "brincos", image_url: wood, sort_order: 3 },
  { id: "cat-acessorios", name: "Acessórios", slug: "acessorios", image_url: editorial, sort_order: 4 }
];

export const demoProducts: Product[] = [
  {
    id: "prod-aurora",
    sku: "FAC-COL-001",
    name: "Colar Aurora",
    slug: "colar-aurora",
    category_id: "cat-colares",
    category_slug: "colares",
    category_name: "Colares",
    description: "Colar de desenho orgânico, pensado para acompanhar o corpo com presença delicada e acabamento atemporal.",
    price_cents: 28900,
    stock: 8,
    images: [linen, editorial],
    featured: true,
    best_seller: true,
    status: "active"
  },
  {
    id: "prod-serra",
    sku: "FAC-PUL-002",
    name: "Pulseira Serra",
    slug: "pulseira-serra",
    category_id: "cat-pulseiras",
    category_slug: "pulseiras",
    category_name: "Pulseiras",
    description: "Pulseira rígida com linhas limpas e textura sutil, criada para uso cotidiano sem perder expressão.",
    price_cents: 21900,
    stock: 5,
    images: [stone, light],
    featured: true,
    best_seller: false,
    status: "active"
  },
  {
    id: "prod-pedra",
    sku: "FAC-BRI-003",
    name: "Brinco Pedra Clara",
    slug: "brinco-pedra-clara",
    category_id: "cat-brincos",
    category_slug: "brincos",
    category_name: "Brincos",
    description: "Brinco leve, com escala precisa e brilho contido para atravessar diferentes ocasiões.",
    price_cents: 18900,
    stock: 0,
    images: [wood, linen],
    featured: true,
    best_seller: true,
    status: "active"
  },
  {
    id: "prod-linha",
    sku: "FAC-ACE-004",
    name: "Prendedor Linha",
    slug: "prendedor-linha",
    category_id: "cat-acessorios",
    category_slug: "acessorios",
    category_name: "Acessórios",
    description: "Acessório de cabelo com proporção escultórica e acabamento suave, feito para durar para além da estação.",
    price_cents: 14900,
    stock: 12,
    images: [light, stone],
    featured: false,
    best_seller: true,
    status: "active"
  }
];
