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
  const isOyku = session.username === "oyku" || session.displayName?.toLowerCase() === "öykü" || session.displayName?.toLowerCase() === "oyku";

  return (
    <div className="px-4 py-5 flex flex-col gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity size={22} style={{ color: "var(--gs-red)" }} />
          Regl Takvimi
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
          {isOyku 
            ? "Tarihin üzerine tıklayarak yeni kayıt ekleyebilir veya silebilirsin."
            : "Bu tabloyu sadece Öykü güncelleyebilir."}
        </p>
      </div>

      <PeriodTrackerClient logs={safeLogs} isOyku={isOyku} />
    </div>
  );
}
