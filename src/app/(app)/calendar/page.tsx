import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import { Calendar } from "lucide-react";
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

  // Get current month range
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  // Fetch 3 months of data for calendar navigation
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
  // Unique set of dates that have photos
  const photoDates = [...new Set((photosResult.data ?? []).map((p: any) => p.taken_date))] as string[];

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={22} style={{ color: "var(--gs-red)" }} />
            Takvim & Fotoğraflar
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            Notlar, ruh halleri ve fotoğraflar tek bir yerde
          </p>
        </div>
        <Link
          href="/photos/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
            color: "white",
          }}
        >
          + Yükle
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: "rgba(232,0,45,0.3)" }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Not</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: "rgba(255,215,0,0.2)" }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Ruh Hali</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: "rgba(34,197,94,0.25)" }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>📷 Fotoğraf</span>
        </div>
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
