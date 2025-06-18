import { createClient } from "@/utils/supabase/server";
import ProdukClientPage from "./client-page";
import { checkAdminRole } from "@/lib/auth-helpers";

export default async function ProdukPage() {
  const supabase = await createClient();

  // Ambil data produk dengan join ke tabel categories
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      stock,
      barcode,
      category_id,
      categories ( name )
    `
    )
    .order("name", { ascending: true });

  // PENTING: Ambil SEMUA kategori untuk dropdown di form
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Ambil data staff yang aktif untuk form transfer
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, name")
    .eq("status", true);

  // Ambil role user saat ini untuk menyembunyikan/menampilkan tombol admin
  let userRole: "admin" | "kasir" | null = null;
  try {
    await checkAdminRole();
    userRole = "admin";
  } catch {
    console.warn("User is not an admin, hiding admin features.");
  }

  if (productsError || staffError || categoriesError) {
    console.error(
      "Error fetching data for ProdukPage:",
      productsError || staffError || categoriesError
    );
    return <p className="p-4">Gagal memuat data. Coba muat ulang halaman.</p>;
  }

  // Kirim `categories` sebagai prop `allCategories` ke client page
  return (
    <ProdukClientPage
      initialProducts={products || []}
      allCategories={categories || []}
      activeStaff={staff || []}
      userRole={userRole}
    />
  );
}
