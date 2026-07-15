import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { logoutAction } from "@/actions/auth";
import { LogOut, Heart } from "lucide-react";
import Link from "next/link";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = session.displayName || 
    (session.username.charAt(0).toUpperCase() + session.username.slice(1));

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
        <Link href="/home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Heart size={20} fill="#E8002D" color="#E8002D" />
          <span
            className="font-display text-gradient font-bold"
            style={{ fontSize: 18 }}
          >
            Emirhan & Öykü
          </span>
          <span style={{ fontSize: 16 }}>💕</span>
        </Link>

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
              className="flex items-center justify-center p-2 rounded-xl transition-all shadow-md"
              style={{
                background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                color: "#ffffff",
              }}
            >
              <LogOut size={20} />
            </button>
          </form>

          {/* Hamburger Menu */}
          <MobileMenu role={session.role} />
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          minHeight: "calc(100dvh - 60px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
