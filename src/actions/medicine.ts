"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { todayString } from "@/lib/date";

// ─── Create Medicine (Admin only) ─────────────────────────────────────────────
const createMedicineSchema = z.object({
  name: z.string().min(1, "İlaç adı gerekli"),
  start_date: z.string().min(1, "Başlangıç tarihi gerekli"),
  end_date: z.string().min(1, "Bitiş tarihi gerekli"),
  time: z.string().min(1, "Saat gerekli"),
});

export async function createMedicineAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = createMedicineSchema.safeParse({
    name: formData.get("name"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    time: formData.get("time"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("medicines").insert({
    ...parsed.data,
    is_active: true,
  });

  if (error) {
    return { error: "İlaç eklenirken hata oluştu." };
  }

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Update Medicine Log (mark as DRANK or MISSED) ───────────────────────────
export async function updateMedicineLogAction(
  medicineId: number,
  status: "DRANK" | "MISSED" | "PENDING"
) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const supabase = createServerClient();
  const today = todayString();

  const { error } = await supabase.from("medicine_logs").upsert(
    {
      user_id: session.userId,
      medicine_id: medicineId,
      date: today,
      status,
    },
    {
      onConflict: "medicine_id,date,user_id",
    }
  );

  if (error) {
    return { error: "Kayıt güncellenirken hata oluştu." };
  }

  revalidatePath("/medicine");
  return { success: true };
}

// ─── Toggle Medicine Active Status (Admin only) ───────────────────────────────
export async function toggleMedicineActiveAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("medicines")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: "Güncellenirken hata oluştu." };

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}

// ─── Delete Medicine (Admin only) ─────────────────────────────────────────────
export async function deleteMedicineAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("medicines").delete().eq("id", id);

  if (error) return { error: "Silinirken hata oluştu." };

  revalidatePath("/medicine");
  revalidatePath("/admin");
  return { success: true };
}
