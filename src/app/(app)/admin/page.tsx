import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, Pill, Users, LineChart, CalendarDays, ChevronRight, Camera, Mail } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Admin Paneli — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const today = dayjs().format("YYYY-MM-DD");

  const [activeMeetingResult, activeMedsResult, todayLoginsResult] = await Promise.all([
    supabase
      .from("meetings")
      .select("title")
      .eq("is_active", true)
      .limit(1)
      .single(),
    supabase
      .from("medicines")
      .select("id")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today),
    supabase
      .from("login_logs")
      .select("id", { count: "exact" })
      .gte("login_at", today + "T00:00:00Z"),
  ]);

  const activeMeeting = activeMeetingResult.data?.title || "Yok";
  const activeMedsCount = activeMedsResult.data?.length || 0;
  const todayLogins = todayLoginsResult.count || 0;

  const dashboardCards = [
    {
      title: "Buluşma Planla",
      description: `Aktif: ${activeMeeting}`,
      icon: <CalendarDays size={24} style={{ color: "var(--gs-red)" }} />,
      href: "/admin/meetings",
      gradient: "linear-gradient(135deg, rgba(232,0,45,0.15) 0%, rgba(232,0,45,0.05) 100%)",
      borderColor: "rgba(232,0,45,0.2)",
    },
    {
      title: "Ruh Hali İstatistikleri",
      description: "Son 30 günün grafikleri",
      icon: <LineChart size={24} style={{ color: "var(--gs-gold)" }} />,
      href: "/admin/moods",
      gradient: "linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)",
      borderColor: "rgba(255,215,0,0.2)",
    },
    {
      title: "İlaç Yönetimi",
      description: `Aktif İlaç: ${activeMedsCount}`,
      icon: <Pill size={24} style={{ color: "#4ade80" }} />,
      href: "/admin/medicines",
      gradient: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)",
      borderColor: "rgba(34,197,94,0.2)",
    },
    {
      title: "Giriş Geçmişi",
      description: `Bugün ${todayLogins} giriş`,
      icon: <Users size={24} style={{ color: "#818cf8" }} />,
      href: "/admin/logs",
      gradient: "linear-gradient(135deg, rgba(129,140,248,0.15) 0%, rgba(129,140,248,0.05) 100%)",
      borderColor: "rgba(129,140,248,0.2)",
    },
    {
      title: "Anı Yönetimi",
      description: "Yeni anı ekle",
      icon: <Camera size={24} style={{ color: "#ec4899" }} />,
      href: "/admin/memories",
      gradient: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.05) 100%)",
      borderColor: "rgba(236,72,153,0.2)",
    },
    {
      title: "Tüm Mektuplar",
      description: "Sistemdeki mektuplar",
      icon: <Mail size={24} style={{ color: "#fcd34d" }} />,
      href: "/admin/letters",
      gradient: "linear-gradient(135deg, rgba(252,211,77,0.15) 0%, rgba(252,211,77,0.05) 100%)",
      borderColor: "rgba(252,211,77,0.2)",
    },
  ];

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard size={26} style={{ color: "var(--gs-red)" }} />
          Admin Paneli
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>
          Yönetim araçlarına hoş geldin Emirhan 👑
        </p>
      </div>

      {/* Cards Grid */}
      <div className="flex flex-col gap-4 mt-2">
        {dashboardCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group relative flex items-center p-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
            style={{
              background: card.gradient,
              border: `1px solid ${card.borderColor}`,
            }}
          >
            {/* Icon Box */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {card.icon}
            </div>

            {/* Texts */}
            <div className="ml-4 flex-1">
              <h2 className="font-bold text-white text-lg">{card.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
                {card.description}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center text-white/30 group-hover:text-white/80 transition-colors">
              <ChevronRight size={24} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
