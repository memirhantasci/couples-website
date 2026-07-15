import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MoodChart } from "@/components/admin/MoodChart";
import { LoginLogsTable } from "@/components/admin/LoginLogsTable";
import { MeetingManager } from "@/components/admin/MeetingManager";
import { LayoutDashboard, Pill, BookOpen, Camera, Users } from "lucide-react";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Admin Panel — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();
  const today = dayjs().format("YYYY-MM-DD");
  const thirtyDaysAgo = dayjs().subtract(29, "day").format("YYYY-MM-DD");

  // Fetch all admin data in parallel
  const [
    todayMedLogsResult,
    activeMedsResult,
    lastNoteResult,
    lastMemoryResult,
    loginLogsResult,
    moodsResult,
    usersResult,
    activeMeetingResult,
  ] = await Promise.all([
    // Today's medicine logs
    supabase
      .from("medicine_logs")
      .select("status")
      .eq("date", today),
    // Active medicines count
    supabase
      .from("medicines")
      .select("id, name")
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today),
    // Last notes from both users
    supabase
      .from("daily_notes")
      .select("content, date, user_id, users(username)")
      .order("date", { ascending: false })
      .limit(5),
    // Last memory
    supabase
      .from("memories")
      .select("title, date")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    // Login logs with user info
    supabase
      .from("login_logs")
      .select("*, users(username)")
      .order("login_at", { ascending: false })
      .limit(50),
    // Moods for chart (last 30 days)
    supabase
      .from("moods")
      .select("date, mood_type, user_id")
      .gte("date", thirtyDaysAgo)
      .lte("date", today)
      .order("date"),
    // All users
    supabase
      .from("users")
      .select("id, username"),
    // Active meeting
    supabase
      .from("meetings")
      .select("id, meeting_datetime, title, is_active")
      .eq("is_active", true)
      .order("meeting_datetime", { ascending: true })
      .limit(1)
      .single(),
  ]);

  const todayLogs = todayMedLogsResult.data ?? [];
  const activeMeds = activeMedsResult.data ?? [];
  const drank = todayLogs.filter((l) => l.status === "DRANK").length;
  const missed = todayLogs.filter((l) => l.status === "MISSED").length;
  const lastNotes = (lastNoteResult.data as any[]) ?? [];
  const lastMemory = lastMemoryResult.data;
  const loginLogs = (loginLogsResult.data as any[]) ?? [];
  const moods = moodsResult.data ?? [];
  const users = usersResult.data ?? [];
  const activeMeeting = activeMeetingResult.data ?? null;

  const statCards = [
    {
      icon: <Pill size={20} />,
      label: "Aktif İlaç",
      value: activeMeds.length,
      color: "var(--gs-red)",
    },
    {
      icon: "✅",
      label: "Bugün Alındı",
      value: drank,
      color: "#4ade80",
    },
    {
      icon: "❌",
      label: "Bugün Alınmadı",
      value: missed,
      color: "#f87171",
    },
    {
      icon: <Users size={20} />,
      label: "Toplam Giriş",
      value: loginLogs.length,
      color: "var(--gs-gold)",
    },
  ];

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard size={22} style={{ color: "var(--gs-red)" }} />
          Admin Paneli
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
          Hoş geldin Emirhan 👑
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 flex flex-col gap-2"
          >
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl text-lg"
              style={{
                background: `${stat.color}18`,
                color: stat.color,
              }}
            >
              {typeof stat.icon === "string" ? stat.icon : stat.icon}
            </div>
            <div>
              <p
                className="font-bold text-2xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Last Memory */}
      {lastMemory && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.12)",
          }}
        >
          <Camera size={18} style={{ color: "var(--gs-gold)" }} />
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "rgba(255,215,0,0.7)" }}
            >
              Son Anı
            </p>
            <p className="font-semibold text-white text-sm">{lastMemory.title}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              {new Date(lastMemory.date + "T00:00:00").toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Meeting Manager */}
      <MeetingManager activeMeeting={activeMeeting} />

      {/* Recent Notes from both users */}
      <div className="glass-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: "var(--gs-gold)" }} />
          <h3 className="font-bold text-white text-sm">Son Günlük Notlar</h3>
        </div>
        {lastNotes.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            Henüz not yok
          </p>
        ) : (
          lastNotes.map((note: any) => (
            <div
              key={note.user_id + note.date}
              className="p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-red text-xs">
                  {note.users?.username === "emirhan" ? "Emirhan" : "Öykü"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                  {new Date(note.date + "T00:00:00").toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {note.content.length > 150
                  ? note.content.substring(0, 150) + "…"
                  : note.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Mood Chart */}
      <MoodChart moods={moods} users={users} />

      {/* Login Logs */}
      <LoginLogsTable logs={loginLogs} />
    </div>
  );
}
