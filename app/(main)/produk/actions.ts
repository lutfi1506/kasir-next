// File: app/(main)/produk/actions.ts
"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Tipe data untuk form, pastikan sesuai dengan input Anda
type ProductFormData = {
  name: string;
  price: number;
  stock: number;
  category_id: string;
  barcode?: string;
};

export async function addProduct(formData: ProductFormData) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(formData)
    .select()
    .single();

  if (error) {
    console.error("Add Product Error:", error);
    return { success: false, message: error.message };
  }

  // RevalidatePath akan memicu pengambilan data ulang di Server Component
  revalidatePath("/produk");
  revalidatePath("/penjualan"); // Revalidasi halaman penjualan juga jika perlu
  return { success: true, message: "Produk berhasil ditambahkan.", data };
}

export async function updateProduct(id: string, formData: ProductFormData) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Product Error:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/produk");
  revalidatePath("/penjualan");
  return { success: true, message: "Produk berhasil diperbarui.", data };
}

export async function deleteProduct(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Delete Product Error:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/produk");
  revalidatePath("/penjualan");
  return { success: true, message: "Produk berhasil dihapus." };
}
