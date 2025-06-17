// app/auth/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
    redirect("/error"); // Arahkan ke halaman error jika ada masalah
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
