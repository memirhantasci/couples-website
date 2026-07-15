import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Calendar } from "lucide-react";
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

  const [notesResult, moodsResult] = await Promise.all([
    supabase
      .from("calendar_notes")
      .select("id, date, note, user:users(username)")
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
  ]);

  const notes = (notesResult.data as any) ?? [];
  const moods = moodsResult.data ?? [];

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar size={22} style={{ color: "var(--gs-red)" }} />
          Takvim
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
          Günlere not eklemek için üzerine dokun
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Calendar */}
      <CalendarView notes={notes} moods={moods} />

      {/* Recent notes list */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2
            className="font-semibold text-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Son Notlar
          </h2>
          {notes.slice(-5).reverse().map((note: any) => (
            <div
              key={note.id}
              className="flex gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="badge badge-red flex-shrink-0 self-start"
                style={{ marginTop: 2 }}
              >
                {new Date(note.date + "T00:00:00").toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                {note.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
