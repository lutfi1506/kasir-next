// File: app/(main)/produk/page.tsx
import { createClient } from "@/utils/supabase/server";
import ProdukClientPage from "./client-page";
import { Product, Category } from "@/lib/types";

export default async function ProdukPage() {
  const supabase = await createClient();

  // Mengambil data produk dengan nama kategori terkait
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (
        name
      )
    `
    )
    .order("name", { ascending: true });

  // Mengambil semua data kategori untuk dropdown di form
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (productsError || categoriesError) {
    console.error("Error fetching data:", productsError || categoriesError);
    return <p>Gagal memuat data. Coba lagi nanti.</p>;
  }

  return (
    <ProdukClientPage
      initialProducts={products as Product[]}
      allCategories={categories as Category[]}
    />
  );
}
