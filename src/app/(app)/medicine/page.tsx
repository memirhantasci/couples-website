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
  userId: number,
  activeMeds: { id: number; time: string; times?: string[] }[]
): Promise<number> {
  if (activeMeds.length === 0) return 0;
  let streak = 0;
  let checkDate = dayjs().tz("Europe/Istanbul").subtract(1, "day").startOf("day");
  const medIds = activeMeds.map((m) => m.id);

  for (let i = 0; i < 180; i++) {
    const dateStr = checkDate.tz("Europe/Istanbul").format("YYYY-MM-DD");
    const { data: logs } = await supabase
      .from("medicine_logs")
      .select("medicine_id, status, time")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .in("medicine_id", medIds);

    if (!logs || logs.length === 0) break;

    let allDosesDrank = true;
    for (const med of activeMeds) {
      const medLogs = logs.filter((l) => l.medicine_id === med.id);
      const hasDrank = medLogs.some((l) => l.status === "DRANK");
      const hasMissed = medLogs.some((l) => l.status === "MISSED");
      if (!hasDrank || hasMissed) {
        allDosesDrank = false;
        break;
      }
    }

    if (!allDosesDrank) break;
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

  const streakValue = await calculateStreak(supabase, session.userId, medicines);

  const dateLabel = dayjs().locale("tr").tz("Europe/Istanbul").format("D MMMM YYYY, dddd");

  return (
    <div className="flex flex-col max-w-lg mx-auto" style={{ paddingBottom: 64, backgroundColor: "#0c0c0c", minHeight: "100vh" }}>
      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#d4a373" }}>
            İlaç Takibi
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {dateLabel}
          </p>
        </div>

        {streakValue >= 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Trophy size={14} style={{ color: "#d4a373" }} />
            <span className="font-medium text-sm" style={{ color: "#d4a373" }}>
              {streakValue} günlük seri
            </span>
          </div>
        )}
      </div>

      {/* ── STAT CIRCLES & CONTENT ─────────────────────────────────── */}
      <MedicineTracker
        medicines={medicines}
        todayLogs={todayLogs}
        historicalLogs={historicalLogs}
        userId={session.userId}
      />
    </div>
  );
}
