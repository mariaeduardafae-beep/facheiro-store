import fs from "fs";
import path from "path";
import { demoCategories, demoProducts } from "./demo-data";
import type { Category, Product } from "./types";

const DB_PATH = path.join(process.cwd(), "src/lib/local-db.json");

function readDb(): { products: Product[]; categories: Category[] } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = { products: demoProducts, categories: demoCategories };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler banco local:", error);
    return { products: demoProducts, categories: demoCategories };
  }
}

function writeDb(data: { products: Product[]; categories: Category[] }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Erro ao escrever no banco local:", error);
  }
}

export function getLocalProducts(): Product[] {
  return readDb().products;
}

export function saveLocalProducts(products: Product[]): void {
  const db = readDb();
  db.products = products;
  writeDb(db);
}

export function getLocalCategories(): Category[] {
  return readDb().categories;
}

export function saveLocalCategories(categories: Category[]): void {
  const db = readDb();
  db.categories = categories;
  writeDb(db);
}
