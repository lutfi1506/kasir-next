// app/(main)/petugas/page.tsx (File Baru)

import { createClient } from "@/utils/supabase/server";
import PetugasClientPage from "./client-page"; // Impor komponen client

export default async function PetugasPage() {
  const supabase = await createClient();

  // Ambil data staff langsung dari Supabase di server
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    // Sebaiknya tangani error dengan lebih baik, misal menampilkan halaman error
    console.error("Error fetching staff:", error);
    return <p>Gagal memuat data petugas.</p>;
  }

  // Kirim data yang sudah di-fetch sebagai props ke komponen client
  return <PetugasClientPage initialStaff={staff || []} />;
}
