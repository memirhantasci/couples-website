"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const meetingSchema = z.object({
  meeting_datetime: z.string().min(1, "Tarih/saat gerekli"),
  title: z.string().optional(),
});

export async function createMeetingAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = meetingSchema.safeParse({
    meeting_datetime: formData.get("meeting_datetime"),
    title: formData.get("title") || "Buluşma",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();

  // Create new meeting
  const { error } = await supabase.from("meetings").insert({
    meeting_datetime: parsed.data.meeting_datetime,
    title: parsed.data.title || "Buluşma",
    is_active: true,
  });

  if (error) {
    return { error: "Buluşma eklenirken hata oluştu." };
  }

  revalidatePath("/home");
  revalidatePath("/admin");
  return { success: true };
}

export async function deactivateMeetingAction(id: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("meetings")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: "Güncelleme başarısız." };

  revalidatePath("/home");
  revalidatePath("/admin");
  return { success: true };
}

// Calendar notes
const calendarNoteSchema = z.object({
  date: z.string().min(1, "Tarih gerekli"),
  note: z.string().min(1, "Not gerekli").max(500),
});

export async function upsertCalendarNoteAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const parsed = calendarNoteSchema.safeParse({
    date: formData.get("date"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();

  // Check if note exists for this date
  const { data: existing } = await supabase
    .from("calendar_notes")
    .select("id, user_id")
    .eq("date", parsed.data.date)
    .single();

  if (existing) {
    if (existing.user_id !== session.userId) {
      return { error: "Bu not başkasına ait, değiştiremezsiniz." };
    }
    await supabase
      .from("calendar_notes")
      .update({ note: parsed.data.note, user_id: session.userId })
      .eq("id", existing.id);
  } else {
    await supabase.from("calendar_notes").insert({
      date: parsed.data.date,
      note: parsed.data.note,
      user_id: session.userId,
    });
  }

  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteCalendarNoteAction(id: number) {
  const session = await getSession();
  if (!session) return { error: "Oturum bulunamadı." };

  const supabase = createServerClient();
  
  const { data: existing } = await supabase
    .from("calendar_notes")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Not bulunamadı." };
  if (existing.user_id !== session.userId) return { error: "Bu notu sadece yazan silebilir." };

  const { error } = await supabase.from("calendar_notes").delete().eq("id", id);

  if (error) return { error: "Silme başarısız." };

  revalidatePath("/calendar");
  return { success: true };
}
