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

  const dateStr = dayjs().locale("tr").format("DD MMMM dddd").toUpperCase();

  // Genel kart stili (fotoğraftaki gibi)
  const cardStyle = {
    background: "#181a20",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto" style={{ paddingBottom: 100 }}>

      {/* ── HERO CARD ─────────────────────────────────── */}
      <div style={cardStyle} className="flex flex-row items-stretch justify-between gap-2">
        {/* Left: date + greeting */}
        <div className="flex-1 flex flex-col justify-center">
          <p
            className="text-[10px] font-medium tracking-wide mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {dateStr}
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "#ffffff" }}>
            Günaydın,<br/>{hitap} <span style={{ fontSize: "28px" }}>❤️</span>
          </h1>
        </div>

        {/* Right: counters (Yan Yana) */}
        <div className="flex gap-2">
          {/* Tanışalı counter */}
          <div
            className="flex flex-col items-center justify-center rounded-xl"
            style={{
              border: "2px solid #C4A15A",
              background: "rgba(196, 161, 90, 0.05)",
              width: 90,
              height: "100%",
              padding: "16px 8px",
            }}
          >
            <span
              className="text-[26px] font-bold leading-none mb-1"
              style={{ color: "#ffffff" }}
            >
              {daysSinceMeeting}
            </span>
            <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "rgba(255,255,255,0.7)" }}>
              gün tanışalı 🤝
            </span>
          </div>
          {/* Sevgili counter */}
          <div
            className="flex flex-col items-center justify-center rounded-xl"
            style={{
              border: "2px solid #D84257",
              background: "rgba(216, 66, 87, 0.05)",
              width: 90,
              height: "100%",
              padding: "16px 8px",
            }}
          >
            <span className="text-[26px] font-bold leading-none mb-1" style={{ color: "#ffffff" }}>
              {daysSinceTogether}
            </span>
            <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "rgba(255,255,255,0.7)" }}>
              gün sevgili ❤️
            </span>
          </div>
        </div>
      </div>

      {/* ── GÜNÜN SÖZÜ ────────────────────────────────── */}
      <div style={cardStyle}>
        <h2 className="text-xl font-bold mb-3" style={{ color: "#ffffff" }}>
          Günün Sözü
        </h2>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          &quot;{quote}&quot;
        </p>
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

    </div>
  );
}
