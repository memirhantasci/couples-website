import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { PeriodTrackerClient } from "@/components/calendar/PeriodTrackerClient";

export const metadata: Metadata = {
  title: "Regl Takvimi — Emirhan & Öykü 💕",
  description: "Regl takibi",
};

export const dynamic = "force-dynamic";

export default async function PeriodTrackerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: logs, error } = await supabase
    .from("period_logs")
    .select("id, date")
    .order("date", { ascending: false });

  if (error) console.error("Period logs fetch error:", error);

  const safeLogs = (logs as any[]) ?? [];
  const nameLower = session.displayName?.toLowerCase() || "";
  const isOyku = session.username === "oyku" || nameLower.includes("öykü") || nameLower.includes("oyku");

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
          >
            <Activity size={18} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Regl Takvimi
          </h1>
        </div>
        <p className="text-xs ml-[52px]" style={{ color: "var(--text-tertiary)" }}>
          {isOyku 
            ? "Tarihin üzerine tıklayarak kayıt ekleyebilir veya silebilirsin."
            : "Bu tabloyu sadece Öykü güncelleyebilir."}
        </p>
      </div>

      <PeriodTrackerClient logs={safeLogs} isOyku={isOyku} />
    </div>
  );
}
