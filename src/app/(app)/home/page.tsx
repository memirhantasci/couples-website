import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTodayHitap, daysSince, getLoveMeter, dayOfYear } from "@/lib/date";
import { getQuoteForDay } from "@/lib/quotes";
import { MeetingCountdown } from "@/components/home/MeetingCountdown";
import { LoveMeter } from "@/components/home/LoveMeter";
import { MoodSelector } from "@/components/home/MoodSelector";
import { DailyNoteCard } from "@/components/home/DailyNoteCard";
import dayjs from "dayjs";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Ana Sayfa — Emirhan & Öykü 💕",
};

// Force dynamic rendering (for date-dependent content)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();
  const today = dayjs().format("YYYY-MM-DD");
  const doy = dayOfYear();

  // Fetch all data in parallel
  const [moodResult, noteResult, meetingResult] = await Promise.all([
    supabase
      .from("moods")
      .select("mood_type")
      .eq("user_id", session.userId)
      .eq("date", today)
      .single(),
    supabase
      .from("daily_notes")
      .select("content")
      .eq("user_id", session.userId)
      .eq("date", today)
      .single(),
    supabase
      .from("meetings")
      .select("id, meeting_datetime, title")
      .eq("is_active", true)
      .order("meeting_datetime", { ascending: true })
      .limit(1)
      .single(),
  ]);

  const hitap = getTodayHitap();
  const meetingDate = dayjs("2026-01-19");
  const togetherDate = dayjs("2026-01-26");
  const daysSinceMeeting = daysSince(meetingDate);
  const daysSinceTogether = daysSince(togetherDate);
  const loveMeter = getLoveMeter();
  const quote = getQuoteForDay(doy);
  const currentMood = moodResult.data?.mood_type ?? null;
  const currentNote = noteResult.data?.content ?? null;
  const activeMeeting = meetingResult.data;

  const displayName = session.username === "emirhan" ? "Emirhan" : "Öykü";

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">

      {/* Günaydın Card */}
      <div
        className="glass-card p-6 text-center relative overflow-hidden"
        style={{ animationDelay: "0s" }}
      >
        {/* Decorative hearts */}
        <div
          className="absolute top-3 left-4 text-2xl animate-float opacity-30"
          style={{ animationDelay: "-1s" }}
          aria-hidden="true"
        >
          💕
        </div>
        <div
          className="absolute top-4 right-5 text-xl animate-float opacity-20"
          style={{ animationDelay: "-2s" }}
          aria-hidden="true"
        >
          ✨
        </div>

        <p
          className="font-semibold mb-1 uppercase tracking-widest"
          style={{ color: "var(--gs-gold)", fontSize: 11 }}
        >
          {new Date().toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        <h2 className="font-display text-gradient text-3xl font-bold mb-1">
          Günaydın,
        </h2>
        <h2 className="font-display text-white text-2xl font-semibold mb-4">
          {hitap} 💕
        </h2>

        {/* Date counters */}
        <div className="flex justify-center gap-4 mt-2">
          <div
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              minWidth: 100,
            }}
          >
            <span className="text-2xl font-bold text-gradient">
              {daysSinceMeeting}
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600 }}>
              gün tanışalı
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(232,0,45,0.08)",
              border: "1px solid rgba(232,0,45,0.15)",
              minWidth: 100,
            }}
          >
            <span className="text-2xl font-bold text-gradient">
              {daysSinceTogether}
            </span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600 }}>
              gün sevgili
            </span>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div
        className="glass-card p-5 flex gap-3"
        style={{
          borderLeft: "3px solid var(--gs-gold)",
          borderRadius: "0 20px 20px 0",
        }}
      >
        <Sparkles
          size={20}
          style={{ color: "var(--gs-gold)", flexShrink: 0, marginTop: 2 }}
        />
        <div>
          <p
            className="font-semibold text-xs uppercase tracking-wider mb-2"
            style={{ color: "var(--gs-gold)" }}
          >
            Günün Sözü
          </p>
          <p
            className="font-display text-base italic leading-relaxed"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            "{quote}"
          </p>
        </div>
      </div>

      {/* Love Meter */}
      <LoveMeter value={loveMeter} />

      {/* Meeting Countdown (only if active meeting exists) */}
      {activeMeeting && (
        <MeetingCountdown
          targetDate={activeMeeting.meeting_datetime}
          title={activeMeeting.title || "Buluşma"}
        />
      )}

      {/* Mood Selector */}
      <MoodSelector currentMood={currentMood} />

      {/* Daily Note */}
      <DailyNoteCard existingNote={currentNote} />

    </div>
  );
}
