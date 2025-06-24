// app/(main)/penjualan/actions.ts
"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { CartItem } from "@/lib/types";

// Tipe data untuk payload transaksi dari client
interface CheckoutPayload {
  cart: CartItem[];
  customer: string;
  payment: number;
  total: number;
  change: number;
  cashierName: string;
}

export async function processTransaction(payload: CheckoutPayload) {
  const supabase = await createAdminClient();

  // 1. Membuat record di tabel 'transactions'
  const { data: transactionData, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      customer: payload.customer,
      total: payload.total,
      payment: payload.payment,
      change: payload.change,
      cashier_name: payload.cashierName,
    })
    .select()
    .single();

  if (transactionError) {
    console.error("Error creating transaction:", transactionError);
    return { success: false, message: transactionError.message };
  }

  const transactionId = transactionData.id;

  // 2. Menyiapkan data untuk tabel 'transaction_items'
  const transactionItems = payload.cart.map((item) => ({
    transaction_id: transactionId,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.price,
  }));

  // 3. Memasukkan semua item transaksi ke tabel 'transaction_items'
  const { error: itemsError } = await supabase
    .from("transaction_items")
    .insert(transactionItems);

  if (itemsError) {
    console.error("Error inserting transaction items:", itemsError);
    // Jika gagal, hapus transaksi yang sudah dibuat untuk menjaga konsistensi
    await supabase.from("transactions").delete().eq("id", transactionId);
    return { success: false, message: itemsError.message };
  }

  // 4. Mengurangi stok produk (menggunakan RPC untuk operasi atomik)
  const stockUpdates = payload.cart.map((item) => ({
    product_id: item.product.id,
    quantity_to_decrease: item.quantity,
  }));

  for (const update of stockUpdates) {
    const { error: stockError } = await supabase.rpc("decrease_stock", {
      p_product_id: update.product_id,
      p_quantity_to_decrease: update.quantity_to_decrease,
    });

    if (stockError) {
      console.error(
        `Error updating stock for product ${update.product_id}:`,
        stockError
      );
      // Di aplikasi production, Anda mungkin ingin menangani rollback dengan lebih canggih
      return {
        success: false,
        message: `Gagal memperbarui stok untuk produk ID ${update.product_id}: ${stockError.message}`,
      };
    }
  }

  // 5. Revalidasi path untuk memperbarui data di halaman lain
  revalidatePath("/penjualan");
  revalidatePath("/produk");
  revalidatePath("/laporan");

  return {
    success: true,
    message: "Transaksi berhasil diproses.",
    transactionId: transactionId,
  };
}
