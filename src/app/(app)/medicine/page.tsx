import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MedicineTracker } from "@/components/medicine/MedicineTracker";
import { AddMedicineForm } from "@/components/medicine/AddMedicineForm";
import { Pill, Flame, Trophy } from "lucide-react";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "İlaç Takibi — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

// Calculate streak for active medicines only
async function calculateStreak(
  supabase: ReturnType<typeof createServerClient>,
  userId: number
): Promise<number> {
  const { data: activeMeds } = await supabase
    .from("medicines")
    .select("id")
    .eq("is_active", true);

  if (!activeMeds || activeMeds.length === 0) return 0;

  const medIds = activeMeds.map((m) => m.id);

  // Go back from today and check each day
  let streak = 0;
  let checkDate = dayjs().startOf("day");

  for (let i = 0; i < 365; i++) {
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

  const [medicinesResult, todayLogsResult, streakValue] = await Promise.all([
    supabase
      .from("medicines")
      .select("id, name, time, start_date, end_date, is_active")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("time"),
    supabase
      .from("medicine_logs")
      .select("medicine_id, status")
      .eq("user_id", session.userId)
      .eq("date", today),
    calculateStreak(supabase, session.userId),
  ]);

  const medicines = medicinesResult.data ?? [];
  const todayLogs = todayLogsResult.data ?? [];

  // Streak badge
  const streakBadge =
    streakValue >= 100
      ? { label: "💎 100 Gün Şampiyonu!", cls: "streak-badge-100" }
      : streakValue >= 30
      ? { label: "🌟 30 Gün Ustası!", cls: "streak-badge-30" }
      : streakValue >= 7
      ? { label: "🔥 7 Günlük Seri!", cls: "streak-badge-7" }
      : null;

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Pill size={22} style={{ color: "var(--gs-red)" }} />
            İlaç Takibi
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            {dayjs().locale("tr").format("D MMMM YYYY")}
          </p>
        </div>

        {/* Streak */}
        {streakValue > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,165,0,0.1)",
              border: "1px solid rgba(255,165,0,0.2)",
            }}
          >
            <Flame size={16} style={{ color: "#ff8c00" }} />
            <span
              className="font-bold"
              style={{ color: "#ff8c00", fontSize: 15 }}
            >
              {streakValue}
            </span>
          </div>
        )}
      </div>

      {/* Streak Badge */}
      {streakBadge && (
        <div
          className={`streak-badge ${streakBadge.cls}`}
          style={{ alignSelf: "flex-start" }}
        >
          <Trophy size={14} />
          {streakBadge.label}
        </div>
      )}

      {/* Admin: Add Medicine Form */}
      {session.role === "ADMIN" && <AddMedicineForm />}

      {/* Medicine Tracker */}
      <div className="glass-card p-4">
        <h2
          className="font-semibold text-sm mb-4"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Bugünün İlaçları
        </h2>
        <MedicineTracker
          medicines={medicines}
          todayLogs={todayLogs}
          userId={session.userId}
        />
      </div>
    </div>
  );
}
