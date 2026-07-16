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
import { Sparkles } from "lucide-react";

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

  const dateStr = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">

      {/* ── HERO CARD ─────────────────────────────────── */}
      <div
        className="glass-card overflow-hidden relative"
        style={{
          padding: "32px 24px 28px",
          background: "linear-gradient(135deg, rgba(15,10,25,0.88) 0%, rgba(30,10,15,0.82) 100%)",
        }}
      >
        {/* Decorative glow blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 200, height: 200,
            top: -60, right: -60,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,0,45,0.35) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
          aria-hidden
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 150, height: 150,
            bottom: -40, left: -30,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
          aria-hidden
        />

        {/* Floating emojis */}
        <span
          className="absolute animate-float select-none"
          style={{ top: 16, right: 24, fontSize: 28, opacity: 0.55, animationDelay: "-1s" }}
          aria-hidden
        >💕</span>
        <span
          className="absolute animate-float select-none"
          style={{ top: 48, right: 64, fontSize: 18, opacity: 0.3, animationDelay: "-3s" }}
          aria-hidden
        >✨</span>

        <p
          className="font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--gs-gold)", fontSize: 11 }}
        >
          {dateStr}
        </p>

        <h1 className="font-display text-4xl font-bold mb-1 leading-tight" style={{ lineHeight: 1.2 }}>
          <span className="text-gradient">Günaydın,</span>
        </h1>
        <h2
          className="font-display text-2xl font-semibold mb-6"
          style={{ color: "rgba(255,255,255,0.90)" }}
        >
          {hitap} 💕
        </h2>

        {/* Date counters */}
        <div className="flex gap-3">
          <div
            className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <span className="text-3xl font-bold text-gradient">{daysSinceMeeting}</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, textAlign: "center" }}>
              gün tanışalı 💫
            </span>
          </div>
          <div
            className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{
              background: "rgba(232,0,45,0.1)",
              border: "1px solid rgba(232,0,45,0.2)",
            }}
          >
            <span className="text-3xl font-bold text-gradient">{daysSinceTogether}</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, textAlign: "center" }}>
              gün sevgili ❤️
            </span>
          </div>
        </div>
      </div>

      {/* ── GÜNÜN SÖZÜ ────────────────────────────────── */}
      <div
        className="glass-card flex gap-4 items-start"
        style={{ padding: "20px 22px", borderLeft: "3px solid var(--gs-gold)" }}
      >
        <Sparkles size={22} style={{ color: "var(--gs-gold)", flexShrink: 0, marginTop: 2 }} />
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

      {/* Bottom spacer */}
      <div style={{ height: 8 }} />
    </div>
  );
}
