// app/(main)/penjualan/page.tsx
import { createClient } from "@/utils/supabase/server";
import PenjualanClientPage from "./client-page";
import type { Product } from "@/lib/types";

export default async function PenjualanPage() {
  const supabase = await createClient();

  // Ambil data produk dari Supabase di server
  const { data: products, error } = await supabase
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

  if (error) {
    console.error("Error fetching products:", error);
    return <p>Gagal memuat data produk. Coba lagi nanti.</p>;
  }

  // Ambil data user yang sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PenjualanClientPage
      initialProducts={(products as Product[]) || []}
      user={user}
    />
  );
}
