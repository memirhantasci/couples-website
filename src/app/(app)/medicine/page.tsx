import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MedicineTracker } from "@/components/medicine/MedicineTracker";
import { AddMedicineForm } from "@/components/medicine/AddMedicineForm";
import { Flame, Trophy, Pill } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";

export const metadata: Metadata = {
  title: "İlaç Takibi — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

async function calculateStreak(
  supabase: ReturnType<typeof createServerClient>,
  userId: number,
  medIds: number[]
): Promise<number> {
  if (medIds.length === 0) return 0;
  let streak = 0;
  let checkDate = dayjs().subtract(1, "day").startOf("day");
  for (let i = 0; i < 180; i++) {
    const dateStr = checkDate.format("YYYY-MM-DD");
    const { data: logs } = await supabase
      .from("medicine_logs")
      .select("medicine_id, status")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .in("medicine_id", medIds);
    if (!logs || logs.length === 0) break;
    const allDrank = medIds.every((id) =>
      logs.some((l) => l.medicine_id === id && l.status === "DRANK")
    );
    if (!allDrank) break;
    streak++;
    checkDate = checkDate.subtract(1, "day");
  }
  return streak;
}

export default async function MedicinePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();
  const today = dayjs().format("YYYY-MM-DD");
  const fourteenDaysAgo = dayjs().subtract(14, "day").format("YYYY-MM-DD");

  const [medicinesResult, todayLogsResult, historicalLogsResult, usersResult] = await Promise.all([
    supabase
      .from("medicines")
      .select("id, name, time, start_date, end_date, is_active, user_id")
      .eq("is_active", true)
      .eq("user_id", session.userId)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("time"),
    supabase
      .from("medicine_logs")
      .select("medicine_id, status, date")
      .eq("user_id", session.userId)
      .eq("date", today),
    supabase
      .from("medicine_logs")
      .select("medicine_id, status, date")
      .eq("user_id", session.userId)
      .gte("date", fourteenDaysAgo)
      .lt("date", today)
      .order("date", { ascending: false }),
    supabase
      .from("users")
      .select("id, username")
      .order("username"),
  ]);

  const medicines = medicinesResult.data ?? [];
  const todayLogs = todayLogsResult.data ?? [];
  const historicalLogs = historicalLogsResult.data ?? [];
  const users = usersResult?.data ?? [];
  const medIds = medicines.map((m) => m.id);
  const streakValue = await calculateStreak(supabase, session.userId, medIds);

  return (
    <div className="px-4 py-6 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pill size={20} style={{ color: "var(--gs-red)" }} />
              <h1 className="text-xl font-bold text-white">İlaç Takibi</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {dayjs().locale("tr").format("D MMMM YYYY, dddd")}
            </p>
          </div>

          {streakValue > 0 && (
            <div
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(255,140,0,0.1)",
                border: "1px solid rgba(255,140,0,0.2)",
              }}
            >
              <div className="flex items-center gap-1">
                <Flame size={18} style={{ color: "#ff8c00" }} />
                <span className="font-bold text-2xl" style={{ color: "#ff8c00" }}>{streakValue}</span>
              </div>
              <span style={{ color: "rgba(255,140,0,0.7)", fontSize: 11, fontWeight: 600 }}>günlük seri</span>
            </div>
          )}
        </div>

        {/* Streak Badge */}
        {streakValue >= 7 && (
          <div className="mt-3">
            <span
              className={`streak-badge ${streakValue >= 100 ? "streak-badge-100" : streakValue >= 30 ? "streak-badge-30" : "streak-badge-7"}`}
            >
              <Trophy size={13} />
              {streakValue >= 100 ? "💎 100 Gün Şampiyonu!" : streakValue >= 30 ? "🌟 30 Gün Ustası!" : "🔥 7 Günlük Seri!"}
            </span>
          </div>
        )}
      </div>

      {/* Admin: Add Medicine */}
      {session.role === "ADMIN" && (
        <AddMedicineForm users={users} />
      )}

      {/* Today's Medicines */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <span style={{ fontSize: 18 }}>💊</span>
          Bugünün İlaçları
        </h2>
        <MedicineTracker
          medicines={medicines}
          todayLogs={todayLogs}
          historicalLogs={historicalLogs}
          userId={session.userId}
        />
      </div>
    </div>
  );
}
