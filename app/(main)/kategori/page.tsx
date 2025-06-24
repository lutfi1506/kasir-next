import { createClient } from "@/utils/supabase/server";
import KategoriClientPage from "./client-page";
import { Category } from "@/lib/types";

export default async function KategoriPage() {
  const supabase = await createClient();

  // Mengambil semua data kategori dari Supabase
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return <p>Gagal memuat data kategori. Coba lagi nanti.</p>;
  }

  return <KategoriClientPage initialCategories={categories as Category[]} />;
}
