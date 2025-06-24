"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

type CategoryFormData = {
  name: string;
  description?: string;
};

export async function addCategory(formData: CategoryFormData) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(formData)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  // Revalidasi halaman kategori dan produk (untuk dropdown)
  revalidatePath("/kategori");
  revalidatePath("/produk");
  return { success: true, message: "Kategori berhasil ditambahkan.", data };
}

export async function updateCategory(id: string, formData: CategoryFormData) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/kategori");
  revalidatePath("/produk");
  return { success: true, message: "Kategori berhasil diperbarui.", data };
}

export async function deleteCategory(id: string) {
  const supabase = await createAdminClient();
  // Periksa dulu apakah ada produk yang menggunakan kategori ini
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (productError) {
    return { success: false, message: productError.message };
  }

  if (products && products.length > 0) {
    return {
      success: false,
      message:
        "Tidak dapat menghapus kategori karena masih digunakan oleh produk.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/kategori");
  revalidatePath("/produk");
  return { success: true, message: "Kategori berhasil dihapus." };
}
