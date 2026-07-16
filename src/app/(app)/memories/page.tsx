import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";
import { Camera } from "lucide-react";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Özel Günlerimiz — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: memories } = await supabase
    .from("memories")
    .select("id, date, title, description, image_url, is_default")
    .order("date", { ascending: true });

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
          >
            <Camera size={18} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Özel Günlerimiz
          </h1>
        </div>
        <p className="text-xs ml-[52px]" style={{ color: "var(--text-tertiary)" }}>
          {(memories ?? []).length} özel gün • birlikte yaşananlar ❤️
        </p>
      </div>

      {/* Timeline */}
      <MemoryTimeline
        memories={memories ?? []}
        isAdmin={session.role === "ADMIN"}
      />
    </div>
  );
}
