import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import { Calendar, Upload } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Takvim — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const threeMonthsAgo = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
  const twoMonthsLater = dayjs().add(2, "month").endOf("month").format("YYYY-MM-DD");

  const [notesResult, moodsResult, photosResult] = await Promise.all([
    supabase
      .from("calendar_notes")
      .select("id, date, note, user:users(username, display_name)")
      .gte("date", threeMonthsAgo)
      .lte("date", twoMonthsLater)
      .order("date"),
    supabase
      .from("moods")
      .select("date, mood_type")
      .eq("user_id", session.userId)
      .gte("date", threeMonthsAgo)
      .lte("date", twoMonthsLater)
      .order("date"),
    supabase
      .from("photo_archive")
      .select(`
        id, user_id, image_url, storage_path, title, description,
        taken_date, taken_time, uploaded_at, exif_found, file_size,
        uploader:users(username, display_name)
      `)
      .order("taken_date", { ascending: false })
      .order("taken_time", { ascending: false }),
  ]);

  const notes = (notesResult.data as any) ?? [];
  const moods = moodsResult.data ?? [];
  const photoDates = [...new Set((photosResult.data ?? []).map((p: any) => p.taken_date))] as string[];

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
            >
              <Calendar size={18} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Takvim & Fotoğraflar
            </h1>
          </div>
          <p className="text-xs ml-[52px]" style={{ color: "var(--text-tertiary)" }}>
            Notlar, ruh halleri ve anılar tek yerde
          </p>
        </div>
        <Link
          href="/photos/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--gs-red) 0%, #C4001F 100%)",
            color: "white",
            boxShadow: "0 3px 12px rgba(232,0,45,0.30)",
          }}
        >
          <Upload size={14} />
          Yükle
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        {[
          { color: "rgba(232,0,45,0.35)", label: "Not" },
          { color: "rgba(245,200,66,0.30)", label: "Ruh Hali" },
          { color: "rgba(34,197,94,0.30)", label: "📷 Fotoğraf" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Client Component for View Toggling */}
      <CalendarPageClient
        notes={notes}
        moods={moods}
        photos={(photosResult.data as any[]) ?? []}
        currentUserId={session.userId}
        currentUsername={session.username}
      />
    </div>
  );
}
