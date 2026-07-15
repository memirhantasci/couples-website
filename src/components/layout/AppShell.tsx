import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { logoutAction } from "@/actions/auth";
import { LogOut, Heart } from "lucide-react";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = session.username === "emirhan" ? "Emirhan" : "Öykü";

  return (
    <div className="min-h-dvh">
      {/* Top Header — bigger logout button, web-friendly */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5"
        style={{
          background: "rgba(6, 6, 15, 0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Heart size={20} fill="#E8002D" color="#E8002D" />
          <span
            className="font-display text-gradient font-bold"
            style={{ fontSize: 18 }}
          >
            Emirhan & Öykü
          </span>
          <span style={{ fontSize: 16 }}>💕</span>
        </div>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {displayName}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Çıkış Yap"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "rgba(232, 0, 45, 0.12)",
                color: "rgba(232, 0, 45, 0.9)",
                border: "1px solid rgba(232,0,45,0.2)",
                minWidth: 80,
              }}
            >
              <LogOut size={15} />
              <span>Çıkış</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          paddingBottom: "calc(72px + env(safe-area-inset-bottom) + 16px)",
          minHeight: "calc(100dvh - 60px)",
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav role={session.role} />
    </div>
  );
}
