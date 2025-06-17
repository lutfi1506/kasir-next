// app/(main)/petugas/actions.ts (Versi Final)
"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Definisikan tipe untuk data yang datang dari form
type StaffFormData = {
  name: string;
  email: string;
  phone: string;
  role: "admin" | "kasir";
  status: "aktif" | "nonaktif";
  password?: string; // Password opsional, hanya untuk tambah
};

export async function addStaffUser(data: StaffFormData) {
  const supabaseAdmin = await createAdminClient();

  if (!data.password) {
    return { error: { message: "Password tidak boleh kosong." } };
  }

  // 1. Buat user baru di Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
      },
    });

  if (authError) {
    console.error("Supabase Auth Error:", authError.message);
    return { error: authError };
  }

  const newUserId = authData.user.id;

  // 2. Buat profil staff di tabel 'staff'
  const { error: staffError } = await supabaseAdmin.from("staff").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    status: data.status === "aktif", // Konversi ke boolean di sini
    user_id: newUserId,
  });

  if (staffError) {
    console.error("Supabase Staff Table Error:", staffError.message);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return { error: staffError };
  }

  revalidatePath("/petugas");
  return { error: null };
}

export async function updateStaff(id: string, data: StaffFormData) {
  const supabaseAdmin = await createAdminClient();

  const staffData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    status: data.status === "aktif", // Konversi ke boolean di sini
  };

  const { error } = await supabaseAdmin
    .from("staff")
    .update(staffData)
    .eq("id", id);

  if (error) {
    console.error("Update Staff Error:", error);
    return { error };
  }

  revalidatePath("/petugas");
  return { error: null };
}

export async function deactivateStaff(userId: string) {
  const supabaseAdmin = await createAdminClient();

  // 1. Nonaktifkan user di Supabase Auth (ban)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: "876000h" } // 'inf' berarti ban selamanya
  );

  if (authError) {
    console.error("Supabase Auth Ban Error:", authError);
    return { error: authError };
  }

  // 2. Update status di tabel staff menjadi false
  const { error: staffError } = await supabaseAdmin
    .from("staff")
    .update({ status: false })
    .eq("user_id", userId);

  if (staffError) {
    console.error("Update Staff Status to False Error:", staffError);
    // Jika gagal update DB, batalkan ban di Auth
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "0s",
    });
    return { error: staffError };
  }

  revalidatePath("/petugas");
  return { error: null };
}

// --- FUNGSI BARU UNTUK MENGAKTIFKAN KEMBALI ---
export async function reactivateStaff(userId: string) {
  const supabaseAdmin = await createAdminClient();

  // 1. Hapus ban user di Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: "0s" } // '0s' akan menghapus ban
  );

  if (authError) {
    console.error("Supabase Auth Unban Error:", authError);
    return { error: authError };
  }

  // 2. Update status di tabel staff menjadi true
  const { error: staffError } = await supabaseAdmin
    .from("staff")
    .update({ status: true })
    .eq("user_id", userId);

  if (staffError) {
    console.error("Update Staff Status to True Error:", staffError);
    // Jika gagal, ban kembali user-nya untuk menjaga konsistensi
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    return { error: staffError };
  }

  revalidatePath("/petugas");
  return { error: null };
}
