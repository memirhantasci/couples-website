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
    <div className="px-4 py-6 flex flex-col gap-0 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Günlüğüm
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          Sadece senin görebildiğin notların
        </p>
      </div>

      {/* Timeline */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📓</span>
          <p style={{ color: "var(--text-tertiary)" }}>Henüz günlüğüne hiçbir şey yazmadın.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[54px] top-0 bottom-0 w-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          <div className="flex flex-col gap-6">
            {notes.map((note) => {
              const dateObj = dayjs(note.date).locale("tr");
              const day = dateObj.format("DD");
              const month = dateObj.format("MMMM YYYY").toUpperCase();
              const weekday = dateObj.format("dddd");

              return (
                <div key={note.id} className="flex gap-5 relative">
                  {/* Date column */}
                  <div
                    className="flex flex-col items-center flex-shrink-0"
                    style={{ width: 54 }}
                  >
                    <span
                      className="font-bold leading-none"
                      style={{ fontSize: 28, color: "var(--text-primary)" }}
                    >
                      {day}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase text-center leading-tight mt-0.5"
                      style={{ color: "var(--gs-gold)" }}
                    >
                      {dateObj.format("MMMM")}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase text-center mt-0.5"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {dateObj.format("dddd").slice(0, 3).toUpperCase()}
                    </span>
                  </div>

                  {/* Dot on timeline */}
                  <div
                    className="absolute flex-shrink-0"
                    style={{
                      left: 54 - 4,
                      top: 8,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.25)",
                      border: "1.5px solid rgba(255,255,255,0.08)",
                    }}
                  />

                  {/* Content card */}
                  <div
                    className="flex-1 rounded-[16px] p-4 relative min-w-0"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {/* Three dots */}
                    <button
                      className="absolute top-3 right-3"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.25)",
                        fontSize: 18,
                        lineHeight: 1,
                        padding: "2px 6px",
                      }}
                    >
                      •••
                    </button>

                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-8"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {note.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
