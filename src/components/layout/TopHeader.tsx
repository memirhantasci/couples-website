"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Heart, LogOut, Menu, X, Home, Pill, Camera, Calendar, LayoutDashboard, Mail, BookText, Images, Upload, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/home",
    label: "Ana Sayfa",
    icon: <Home size={35} strokeWidth={2} />,
  },
  {
    href: "/medicine",
    label: "İlaçlar",
    icon: <Pill size={35} strokeWidth={2} />,
  },
  {
    href: "/memories",
    label: "Özel Günler",
    icon: <Camera size={35} strokeWidth={2} />,
  },
  {
    href: "/calendar",
    label: "Takvim",
    icon: <Calendar size={35} strokeWidth={2} />,
  },
  {
    href: "/daily-notes-user",
    label: "Günlük",
    icon: <BookText size={35} strokeWidth={2} />,
  },
  {
    href: "/letters",
    label: "Mektuplar",
    icon: <Mail size={35} strokeWidth={2} />,
  },
  {
    href: "/period-tracker",
    label: "Regl Takvimi",
    icon: <Activity size={35} strokeWidth={2} />,
  },
  {
    href: "/photos/upload",
    label: "Fotoğraf Yükle",
    icon: <Upload size={35} strokeWidth={2} />,
  },
  {
    href: "/admin",
    label: "Admin Paneli",
    icon: <LayoutDashboard size={35} strokeWidth={2} />,
    adminOnly: true,
  },
];

interface TopHeaderProps {
  role: "ADMIN" | "USER";
  displayName: string;
}

export function TopHeader({ role, displayName }: TopHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold hidden sm:inline-block"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {displayName}
          </span>
          
          <button
            onClick={() => setIsOpen(true)}
            className="p-5 rounded-2xl transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.06)", color: "white" }}
          >
            <Menu size={44} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Drawer (Outside of header to avoid backdrop-filter issues) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[90vw] sm:w-[450px] z-[101] flex flex-col"
              style={{
                background: "rgba(13, 13, 26, 0.98)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-7 border-b border-white/10">
                <span className="font-bold text-white text-4xl">Menü</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-4 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={35} strokeWidth={2.5} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-5 p-6 rounded-[24px] font-bold transition-all text-2xl"
                      style={{
                        background: isActive ? "rgba(232, 0, 45, 0.15)" : "rgba(255,255,255,0.03)",
                        color: isActive ? "var(--gs-red)" : "rgba(255,255,255,0.85)",
                        border: isActive ? "2px solid rgba(232, 0, 45, 0.3)" : "2px solid transparent",
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button in Drawer Footer */}
              <div className="p-7 border-t border-white/10 mt-auto">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-4 py-7 rounded-[24px] font-bold text-2xl transition-all shadow-md"
                    style={{
                      background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                      color: "#ffffff",
                    }}
                  >
                    <LogOut size={35} />
                    <span>Çıkış Yap</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
