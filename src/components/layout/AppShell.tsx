import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { logoutAction } from "@/actions/auth";
import { LogOut, Heart } from "lucide-react";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName =
    session.username === "emirhan" ? "Emirhan" : "Öykü";

  return (
    <div className="min-h-dvh bg-pattern" style={{ background: "var(--dark-950)" }}>
      {/* Background gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute rounded-full opacity-20 blur-3xl animate-float"
          style={{
            width: 500,
            height: 500,
            top: -150,
            right: -100,
            background: "radial-gradient(circle, rgba(232,0,45,0.4) 0%, transparent 70%)",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute rounded-full opacity-15 blur-3xl animate-float"
          style={{
            width: 400,
            height: 400,
            bottom: 100,
            left: -100,
            background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
            animationDelay: "-3s",
          }}
        />
      </div>

      {/* Top Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(8, 8, 17, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-gradient" fill="url(#heartGrad)" />
          <svg width={0} height={0} aria-hidden="true">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8002D" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="font-display text-gradient font-bold"
            style={{ fontSize: 17 }}
          >
            Emirhan & Öykü
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {displayName}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Çıkış Yap"
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
              style={{
                background: "rgba(232, 0, 45, 0.1)",
                color: "rgba(232, 0, 45, 0.8)",
              }}
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="relative"
        style={{
          zIndex: 1,
          paddingBottom: "calc(72px + 16px)",
          minHeight: "calc(100dvh - 64px)",
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav role={session.role} />
    </div>
  );
}
