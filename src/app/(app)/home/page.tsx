import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTodayHitap, daysSince, getLoveMeter, dayOfYear, todayString, dayjs } from "@/lib/date";
import { getQuoteForDay } from "@/lib/quotes";
import { MeetingCountdown } from "@/components/home/MeetingCountdown";
import { LoveMeter } from "@/components/home/LoveMeter";
import { MoodSelector } from "@/components/home/MoodSelector";
import { DailyNoteCard } from "@/components/home/DailyNoteCard";
import { PendingLettersCard } from "@/components/home/PendingLettersCard";
import { Sparkles, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Ana Sayfa — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();
  const today = todayString();
  const doy = dayOfYear();

  const [moodResult, noteResult, meetingResult, pendingLettersResult] = await Promise.all([
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
    supabase
      .from("letters")
      .select("id, unlock_date, sender:users!letters_sender_id_fkey(username, display_name)")
      .eq("receiver_id", session.userId)
      .gt("unlock_date", today)
      .order("unlock_date", { ascending: true }),
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
  const pendingLetters = (pendingLettersResult.data as any[]) ?? [];

  const dateStr = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">

      {/* ── HERO CARD ─────────────────────────────────── */}
      <div
        className="rounded-[24px] overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #1c1c20 0%, #201010 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
          padding: "28px 22px 24px",
        }}
      >
        {/* Decorative red glow top-right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            top: -60,
            right: -50,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,0,45,0.30) 0%, transparent 70%)",
            filter: "blur(28px)",
            pointerEvents: "none",
          }}
        />

        {/* Date label */}
        <p className="page-header-label mb-3" style={{ color: "var(--gs-gold)" }}>
          {dateStr}
        </p>

        {/* Greeting */}
        <h1 className="font-display text-3xl font-bold leading-tight mb-0.5">
          <span className="text-gradient">Günaydın,</span>
        </h1>
        <h2
          className="font-display text-xl font-semibold mb-5"
          style={{ color: "rgba(255,255,255,0.88)" }}
        >
          {hitap} 💕
        </h2>

        {/* Date counters */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-[16px]"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-3xl font-bold text-gradient">{daysSinceMeeting}</span>
            <span
              className="text-[11px] font-semibold text-center"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              gün tanışalı 💫
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1.5 py-4 rounded-[16px]"
            style={{
              background: "rgba(232,0,45,0.10)",
              border: "1px solid rgba(232,0,45,0.18)",
            }}
          >
            <span className="text-3xl font-bold text-gradient">{daysSinceTogether}</span>
            <span
              className="text-[11px] font-semibold text-center"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              gün sevgili ❤️
            </span>
          </div>
        </div>
      </div>

      {/* ── GÜNÜN SÖZÜ ────────────────────────────────── */}
      <div
        className="flex gap-4 items-start p-4 rounded-[18px]"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          borderLeft: "3px solid var(--gs-gold)",
        }}
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(245,200,66,0.12)", color: "var(--gs-gold)" }}
        >
          <Sparkles size={15} />
        </div>
        <div>
          <p className="page-header-label mb-1.5" style={{ color: "var(--gs-gold)" }}>
            Günün Sözü
          </p>
          <p
            className="font-display text-sm italic leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            "{quote}"
          </p>
        </div>
      </div>

      {/* ── AŞK ÖLÇERİ ────────────────────────────────── */}
      <LoveMeter value={loveMeter} />

      {/* ── BULUŞMA GERİ SAYIMI ────────────────────────── */}
      {activeMeeting && (
        <MeetingCountdown
          targetDate={activeMeeting.meeting_datetime}
          title={activeMeeting.title || "Buluşma"}
        />
      )}

      {/* ── RUH HALİ ──────────────────────────────────── */}
      <MoodSelector currentMood={currentMood} moodLocked={!!currentMood} />

      {/* ── GÜNLÜK NOT ────────────────────────────────── */}
      <DailyNoteCard existingNote={currentNote} />

      {/* ── BEKLEYEN MEKTUPLAR ─────────────────────────── */}
      <PendingLettersCard letters={pendingLetters} />

      <div style={{ height: 4 }} />
    </div>
  );
}
