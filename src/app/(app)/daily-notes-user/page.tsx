import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/tr";

export const metadata: Metadata = {
  title: "Günlüğüm — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function DailyNotesUserPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: notesResult } = await supabase
    .from("daily_notes")
    .select("id, date, content")
    .eq("user_id", session.userId)
    .order("date", { ascending: false });

  const notes = notesResult ?? [];

  return (
    <div
      className="px-4 pt-6 pb-8 flex flex-col max-w-lg mx-auto"
      style={{ background: "#0a0a0f", minHeight: "100%" }}
    >
      {/* ─── Header ─── */}
      <div className="mb-6">
        <h1
          className="font-bold leading-tight"
          style={{ fontSize: 30, color: "#ffffff", letterSpacing: "-0.3px" }}
        >
          Günlüğüm
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Sadece senin görebildiğin notların
        </p>
      </div>

      {/* ─── Empty state ─── */}
      {notes.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-[20px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <span className="text-5xl mb-4">📓</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Henüz günlüğüne hiçbir şey yazmadın.
          </p>
        </div>
      )}

      {/* ─── Timeline ─── */}
      {notes.length > 0 && (
        <div className="relative flex flex-col gap-0">
          {/* Vertical line — runs the full height of the list */}
          <div
            className="absolute"
            style={{
              left: 52,          // center of the date column
              top: 12,
              bottom: 12,
              width: 1,
              background: "rgba(255,255,255,0.1)",
              zIndex: 0,
            }}
          />

          {notes.map((note, index) => {
            const dateObj = dayjs(note.date).locale("tr");
            const day     = dateObj.format("D");           // "24"
            const month   = dateObj.format("MMMM YYYY").toUpperCase(); // "TEMMUZ 2026"
            const weekday = dateObj.format("dddd");        // "Cuma"

            return (
              <div
                key={note.id}
                className="flex gap-4 relative"
                style={{ paddingBottom: index < notes.length - 1 ? 28 : 0 }}
              >
                {/* ── Date column ── */}
                <div
                  className="flex flex-col items-center flex-shrink-0 pt-1"
                  style={{ width: 64 }}
                >
                  {/* Day number */}
                  <span
                    className="font-bold leading-none"
                    style={{ fontSize: 32, color: "#ffffff" }}
                  >
                    {day}
                  </span>
                  {/* Month + Year */}
                  <span
                    className="font-semibold text-center leading-tight mt-0.5"
                    style={{
                      fontSize: 9,
                      color: "#c8922a",   // warm gold / amber — matches screenshot
                      letterSpacing: "0.5px",
                    }}
                  >
                    {month}
                  </span>
                  {/* Weekday */}
                  <span
                    className="font-medium text-center mt-0.5"
                    style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}
                  >
                    {weekday}
                  </span>
                </div>

                {/* ── Dot on the line ── */}
                <div
                  className="absolute z-10"
                  style={{
                    left: 52 - 4,   // center the dot on the line
                    top: 12,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                  }}
                />

                {/* ── Content card ── */}
                <div
                  className="flex-1 relative rounded-[14px] p-4 min-w-0"
                  style={{
                    background: "#1a1a1e",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Three-dot menu button */}
                  <button
                    className="absolute"
                    style={{
                      top: 10,
                      right: 12,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: 16,
                      letterSpacing: "2px",
                      lineHeight: 1,
                      padding: "2px 4px",
                    }}
                    aria-label="Seçenekler"
                  >
                    •••
                  </button>

                  {/* Note text */}
                  <p
                    className="whitespace-pre-wrap break-words leading-relaxed"
                    style={{
                      fontSize: 13.5,
                      color: "rgba(255,255,255,0.75)",
                      paddingRight: 28,  // keep text clear of the dots button
                    }}
                  >
                    {note.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
