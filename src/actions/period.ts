"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function togglePeriodLogAction(date: string) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  if (session.username !== "oyku") {
    return { error: "Bu işlemi sadece Öykü yapabilir." };
  }

  const supabase = createServerClient();

  // Check if log exists
  const { data: existing } = await supabase
    .from("period_logs")
    .select("id")
    .eq("user_id", session.userId)
    .eq("date", date)
    .single();

  if (existing) {
    // Delete
    const { error } = await supabase
      .from("period_logs")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: "Kayıt silinirken hata oluştu: " + error.message };
  } else {
    // Insert
    const { error } = await supabase
      .from("period_logs")
      .insert({
        user_id: session.userId,
        date: date,
      });
    if (error) return { error: "Kayıt eklenirken hata oluştu: " + error.message };
  }

  revalidatePath("/period-tracker");
  return { success: true };
}
