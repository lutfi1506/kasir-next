"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { checkAdminRole } from "@/lib/auth-helpers";
import type {
  StockTransferPayload,
  ActionResponse,
  StockTransfer, // Tambahkan tipe StockTransfer
} from "@/lib/types"; // Impor tipe baru

// Tipe ProductFormData bisa kita ambil dari Tipe Product
type ProductFormData = {
  name: string;
  price: number;
  stock: number;
  category_id: string; // <-- Perubahan di sini
  barcode?: string;
};

export async function addProduct(data: ProductFormData): ActionResponse {
  await checkAdminRole();
  const supabase = await createAdminClient();
  const { name, price, stock, category_id, barcode } = data;
  const { error } = await supabase.from("products").insert({
    name,
    price,
    stock,
    category_id,
    barcode,
  });
  if (error) {
    console.error(error);
    return { data: null, error };
  }
  revalidatePath("/produk");
  return { data: null, error: null };
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): ActionResponse {
  await checkAdminRole();
  const supabase = await createAdminClient();
  const { name, price, stock, category_id, barcode } = data;
  const { error } = await supabase
    .from("products")
    .update({
      name,
      price,
      stock,
      category_id,
      barcode,
    })
    .eq("id", id);
  if (error) {
    console.error(error);
    return { data: null, error };
  }
  revalidatePath("/produk");
  return { data: null, error: null };
}

export async function deleteProduct(id: string): ActionResponse {
  await checkAdminRole();
  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error(error);
    return { data: null, error };
  }
  revalidatePath("/produk");
  return { data: null, error: null };
}

export async function addStockTransfer(
  data: StockTransferPayload
): ActionResponse {
  await checkAdminRole();
  const supabase = await createAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", data.productId)
    .single();
  if (productError) return { data: null, error: productError };

  const stockBefore = product.stock;
  const stockAfter =
    data.type === "in"
      ? stockBefore + data.quantity
      : stockBefore - data.quantity;

  if (stockAfter < 0)
    return { data: null, error: { message: "Stok tidak mencukupi." } };

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: stockAfter })
    .eq("id", data.productId);
  if (updateError) return { data: null, error: updateError };

  const { error: transferError } = await supabase
    .from("stock_transfers")
    .insert({
      product_id: data.productId,
      product_name: data.productName,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      notes: data.notes,
      user_id: data.userId,
      user_name: data.userName,
      stock_before: stockBefore,
      stock_after: stockAfter,
    });

  if (transferError) {
    await supabase
      .from("products")
      .update({ stock: stockBefore })
      .eq("id", data.productId);
    return { data: null, error: transferError };
  }

  revalidatePath("/produk");
  return { data: null, error: null };
}
export async function getProductTransfers(
  productId: string
): ActionResponse<StockTransfer[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  const { data, error } = await supabase
    .from("stock_transfers")
    .select("*")
    .eq("product_id", productId)
    .order("date", { ascending: false });

  return { data, error };
}
