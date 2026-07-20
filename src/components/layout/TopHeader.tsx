"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  Heart, LogOut, X, Home, Pill, Camera, Calendar,
  LayoutDashboard, Mail, BookText, Images, Upload, Activity,
  Menu, CalendarDays, LineChart, Users, BookOpen,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/home",       label: "Ana Sayfa",     icon: <Home size={38} strokeWidth={2} /> },
  { href: "/medicine",   label: "İlaçlar",        icon: <Pill size={38} strokeWidth={2} /> },
  { href: "/memories",   label: "Özel Günler",    icon: <Camera size={38} strokeWidth={2} /> },
  { href: "/calendar",   label: "Takvim",         icon: <Calendar size={38} strokeWidth={2} /> },
  { href: "/daily-notes-user", label: "Günlük",   icon: <BookText size={38} strokeWidth={2} /> },
  { href: "/letters",    label: "Mektuplar",      icon: <Mail size={38} strokeWidth={2} /> },
  { href: "/period-tracker", label: "Regl Takvimi", icon: <Activity size={38} strokeWidth={2} /> },
  { href: "/photos", label: "Fotoğraflar", icon: <Images size={38} strokeWidth={2} /> },
  { href: "/photos/upload", label: "Fotoğraf Yükle", icon: <Upload size={38} strokeWidth={2} /> },
  { href: "/admin",      label: "Admin Paneli",   icon: <LayoutDashboard size={38} strokeWidth={2} />, adminOnly: true },
];

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Admin Ana Sayfa", icon: <LayoutDashboard size={38} strokeWidth={2} /> },
  { href: "/admin/meetings", label: "Buluşmalar", icon: <CalendarDays size={38} strokeWidth={2} /> },
  { href: "/admin/moods", label: "Ruh Hali", icon: <LineChart size={38} strokeWidth={2} /> },
  { href: "/admin/medicines", label: "İlaç Yönetimi", icon: <Pill size={38} strokeWidth={2} /> },
  { href: "/admin/logs", label: "Giriş Geçmişi", icon: <Users size={38} strokeWidth={2} /> },
  { href: "/admin/memories", label: "Özel Günler Y.", icon: <Camera size={38} strokeWidth={2} /> },
  { href: "/admin/calendar-events", label: "Kullanıcı Takvimi", icon: <CalendarDays size={38} strokeWidth={2} /> },
  { href: "/admin/daily-notes", label: "Günlük Notlar", icon: <BookOpen size={38} strokeWidth={2} /> },
  { href: "/admin/letters", label: "Tüm Mektuplar", icon: <Mail size={38} strokeWidth={2} /> },
  { href: "/admin/photos", label: "Tüm Fotoğraflar", icon: <Images size={38} strokeWidth={2} /> },
  { href: "/home", label: "Uygulamaya Dön", icon: <Home size={38} strokeWidth={2} /> },
];

interface TopHeaderProps {
  role: "ADMIN" | "USER";
  displayName: string;
}

export function TopHeader({ role, displayName }: TopHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAppMenuExpanded, setIsAppMenuExpanded] = useState(false);

  const itemsToUse = role === "ADMIN" ? adminNavItems : navItems;

  const visibleItems = itemsToUse.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Menü açıkken body scroll'u kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(17, 17, 20, 0.96)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.35)",
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Heart size={18} fill="#E8002D" color="#E8002D" />
          <span
            className="font-display text-gradient font-bold"
            style={{ fontSize: 17 }}
          >
            Emirhan & Öykü
          </span>
          <span style={{ fontSize: 15 }}>💕</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {displayName}
          </span>

          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center rounded-[14px] transition-all"
            style={{
              width: 56,
              height: 56,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.8)",
            }}
            aria-label="Menüyü aç"
          >
            <Menu size={40} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Drawer — Outside header to avoid stacking context issues */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.65)" }}
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[90vw] sm:w-[460px] z-[101] flex flex-col"
              style={{
                background: "#1a1a1e",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-16px 0 48px rgba(0,0,0,0.55)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <span className="font-bold text-white text-[32px]">Menü</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-[14px] transition-all hover:bg-white/10"
                  style={{
                    width: 48,
                    height: 48,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <X size={32} strokeWidth={2} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                {visibleItems.map((item) => {
                  const isAppReturn = item.href === "/home" && role === "ADMIN";
                  const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
                  
                  return (
                    <div key={item.href} className="flex flex-col">
                      <div className="flex items-stretch gap-1">
                        <Link
                          href={item.href}
                          className="flex-1 flex items-center gap-5 px-5 py-4 rounded-[16px] font-semibold transition-all text-[28px]"
                          style={{
                            background: isActive ? "rgba(232, 0, 45, 0.12)" : "transparent",
                            color: isActive ? "var(--gs-red)" : "rgba(255,255,255,0.75)",
                            border: isActive ? "1px solid rgba(232, 0, 45, 0.22)" : "1px solid transparent",
                          }}
                        >
                          <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                        {isAppReturn && (
                          <button
                            onClick={() => setIsAppMenuExpanded(!isAppMenuExpanded)}
                            className="px-4 rounded-[16px] transition-all flex items-center justify-center active:scale-95"
                            style={{ 
                              background: isAppMenuExpanded ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.85)" 
                            }}
                          >
                            {isAppMenuExpanded ? <ChevronUp size={34} /> : <ChevronDown size={34} />}
                          </button>
                        )}
                      </div>

                      {isAppReturn && (
                        <AnimatePresence>
                          {isAppMenuExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden flex flex-col pl-4 pr-1 gap-1 mt-2"
                            >
                              <div className="pl-6 border-l-2 border-white/10 py-2 flex flex-col gap-2">
                                {navItems.filter(i => !i.adminOnly && i.href !== "/home").map(subItem => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className="flex items-center gap-4 px-4 py-3 rounded-[14px] font-semibold transition-all text-[24px] active:bg-white/5"
                                    style={{
                                      color: "rgba(255,255,255,0.65)",
                                    }}
                                  >
                                    <span style={{ opacity: 0.7, transform: "scale(0.85)" }}>{subItem.icon}</span>
                                    <span>{subItem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Logout Button in Drawer Footer */}
              <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-4 py-4 rounded-[16px] font-bold text-[28px] transition-all"
                    style={{
                      background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                      color: "#ffffff",
                      boxShadow: "0 4px 16px rgba(232, 0, 45, 0.3)",
                    }}
                  >
                    <LogOut size={32} />
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
