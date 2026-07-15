import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MemoryTimeline } from "@/components/memories/MemoryTimeline";
import { Camera } from "lucide-react";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Anılarımız — Emirhan & Öykü 💕",
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
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera size={22} style={{ color: "var(--gs-red)" }} />
          Anılarımız
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
          {(memories ?? []).length} anı • birlikte yaşananlar ❤️
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
