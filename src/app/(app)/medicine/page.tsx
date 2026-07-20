import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MedicineTracker } from "@/components/medicine/MedicineTracker";
import { AddMedicineForm } from "@/components/medicine/AddMedicineForm";
import { Flame, Trophy, Pill } from "lucide-react";
import { dayjs, todayString } from "@/lib/date";

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
  let checkDate = dayjs().tz("Europe/Istanbul").subtract(1, "day").startOf("day");
  for (let i = 0; i < 180; i++) {
    const dateStr = checkDate.tz("Europe/Istanbul").format("YYYY-MM-DD");
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
  const today = todayString();
  const fourteenDaysAgo = dayjs().tz("Europe/Istanbul").subtract(14, "day").tz("Europe/Istanbul").format("YYYY-MM-DD");

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
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">

      {/* Header Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
              >
                <Pill size={16} />
              </div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                İlaç Takibi
              </h1>
            </div>
            <p className="text-xs ml-[44px]" style={{ color: "var(--text-tertiary)" }}>
              {dayjs().locale("tr").tz("Europe/Istanbul").format("D MMMM YYYY, dddd")}
            </p>
          </div>

          {streakValue > 0 && (
            <div
              className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-[14px]"
              style={{
                background: "rgba(255,140,0,0.10)",
                border: "1px solid rgba(255,140,0,0.18)",
              }}
            >
              <div className="flex items-center gap-1">
                <Flame size={16} style={{ color: "#ff8c00" }} />
                <span className="font-bold text-xl" style={{ color: "#ff8c00" }}>
                  {streakValue}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,140,0,0.65)" }}
              >
                günlük seri
              </span>
            </div>
          )}
        </div>

        {/* Streak Badge */}
        {streakValue >= 7 && (
          <div className="mt-3">
            <span
              className={`streak-badge ${
                streakValue >= 100
                  ? "streak-badge-100"
                  : streakValue >= 30
                    ? "streak-badge-30"
                    : "streak-badge-7"
              }`}
            >
              <Trophy size={12} />
              {streakValue >= 100
                ? "💎 100 Gün Şampiyonu!"
                : streakValue >= 30
                  ? "🌟 30 Gün Ustası!"
                  : "🔥 7 Günlük Seri!"}
            </span>
          </div>
        )}
      </div>

      {/* Admin: Add Medicine */}
      {session.role === "ADMIN" && (
        <AddMedicineForm users={users} />
      )}

      {/* Today's Medicines */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <span style={{ fontSize: 17 }}>💊</span>
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
