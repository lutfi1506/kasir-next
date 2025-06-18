"use server";

import { createClient } from "@/utils/supabase/server";

export async function checkAdminRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error(
      "Akses ditolak: Anda harus login untuk melakukan aksi ini."
    );
  }
  const { data: staff, error } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !staff) {
    throw new Error("Akses ditolak: Profil Anda tidak ditemukan.");
  }

  if (staff.role !== "admin") {
    throw new Error("Akses ditolak: Aksi ini memerlukan hak akses admin.");
  }
}
