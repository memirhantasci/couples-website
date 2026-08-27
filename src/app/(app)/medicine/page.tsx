import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MedicineTracker } from "@/components/medicine/MedicineTracker";
import { Trophy } from "lucide-react";
import { dayjs, todayString } from "@/lib/date";
import "dayjs/locale/tr";

export const metadata: Metadata = {
  title: "İlaç Takibi — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

async function calculateStreak(
  supabase: ReturnType<typeof createServerClient>,
  userId: number
): Promise<number> {
  const { data: allMeds } = await supabase
    .from("medicines")
    .select("id, time, times, start_date, end_date")
    .eq("user_id", userId);

  if (!allMeds || allMeds.length === 0) return 0;

  const checkDateStart = dayjs().tz("Europe/Istanbul").subtract(180, "day").format("YYYY-MM-DD");
  const checkDateEnd = dayjs().tz("Europe/Istanbul").format("YYYY-MM-DD");

  // Fetch all logs for the last 180 days in a SINGLE query
  const { data: allLogs } = await supabase
    .from("medicine_logs")
    .select("medicine_id, status, time, date")
    .eq("user_id", userId)
    .gte("date", checkDateStart)
    .lte("date", checkDateEnd);

  // Group logs by date for fast lookup
  const logsByDate = (allLogs || []).reduce((acc: Record<string, any[]>, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  let streak = 0;
  let checkDate = dayjs().tz("Europe/Istanbul").startOf("day");

  for (let i = 0; i < 180; i++) {
    const dateStr = checkDate.tz("Europe/Istanbul").format("YYYY-MM-DD");
    const isToday = i === 0;
    
    // Find medicines active on this day
    const activeMedsForDay = allMeds.filter(med => {
      return med.start_date <= dateStr && med.end_date >= dateStr;
    });

    if (activeMedsForDay.length === 0) {
      if (isToday) {
        checkDate = checkDate.subtract(1, "day");
        continue;
      } else {
        break; // Streak breaks if there are no active meds on a past day
      }
    }

    const logs = logsByDate[dateStr] || [];

    let allDosesDrank = true;
    for (const med of activeMedsForDay) {
      const medLogs = logs.filter((l) => l.medicine_id === med.id);
      
      const expectedDosesCount = Array.isArray(med.times) && med.times.length > 0 
        ? med.times.length 
        : 1;
        
      const drankCount = medLogs.filter((l) => l.status === "DRANK").length;
      const hasMissed = medLogs.some((l) => l.status === "MISSED");

      if (drankCount < expectedDosesCount || hasMissed) {
        allDosesDrank = false;
        break;
      }
    }

    if (!allDosesDrank) {
      if (isToday) {
        // If today is incomplete, we don't break the streak, we just don't increment it yet.
        checkDate = checkDate.subtract(1, "day");
        continue;
      } else {
        break;
      }
    }
    
    streak++;
    checkDate = checkDate.subtract(1, "day");
  }
  return streak;
}

export default async function MedicinePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();
  const today = todayString();
  const fourteenDaysAgo = dayjs().tz("Europe/Istanbul").subtract(14, "day").tz("Europe/Istanbul").format("YYYY-MM-DD");

  const [medicinesResult, todayLogsResult, historicalLogsResult] = await Promise.all([
    supabase
      .from("medicines")
      .select("id, name, time, times, start_date, end_date, is_active, user_id")
      .eq("is_active", true)
      .eq("user_id", session.userId)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("time"),
    supabase
      .from("medicine_logs")
      .select("medicine_id, status, date, time")
      .eq("user_id", session.userId)
      .eq("date", today),
    supabase
      .from("medicine_logs")
      .select("medicine_id, status, date, time")
      .eq("user_id", session.userId)
      .gte("date", fourteenDaysAgo)
      .lt("date", today)
      .order("date", { ascending: false }),
  ]);

  const medicines = medicinesResult.data ?? [];
  const todayLogs = todayLogsResult.data ?? [];
  const historicalLogs = historicalLogsResult.data ?? [];

  const streakValue = await calculateStreak(supabase, session.userId);

  const dateLabel = dayjs().locale("tr").tz("Europe/Istanbul").format("D MMMM YYYY, dddd");

  return (
    <div
      className="flex flex-col max-w-lg mx-auto pb-24 min-h-[100dvh]"
      style={{
        backgroundColor: "#0c0c0c",
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(232, 0, 45, 0.05) 0%, transparent 50%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 20px 20px, 20px 20px"
      }}
    >
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="px-4 pt-6 pb-2 flex flex-col items-center">
        <h2 style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#E8002D",
          textAlign: "center",
          letterSpacing: "1px",
          marginBottom: 8,
        }}>
          İLAÇ TAKİBİ 💊
        </h2>
        
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {dateLabel}
          </p>
          {streakValue >= 0 && (
            <div className="flex items-center gap-1.5">
              <Trophy size={14} style={{ color: "#d4a373" }} />
              <span className="font-medium text-sm" style={{ color: "#d4a373" }}>
                {streakValue} günlük seri
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── STAT CIRCLES & CONTENT ─────────────────────────────────── */}
      <MedicineTracker
        medicines={medicines}
        todayLogs={todayLogs}
        historicalLogs={historicalLogs}
        userId={session.userId}
        currentStreak={streakValue}
        userName={session.username}
      />
    </div>
  );
}
