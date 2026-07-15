"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Pill, Camera, Calendar, LayoutDashboard, Mail, BookText, Images, Upload } from "lucide-react";
import { motion } from "framer-motion";
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
    icon: <Home size={20} strokeWidth={2} />,
  },
  {
    href: "/medicine",
    label: "İlaçlar",
    icon: <Pill size={20} strokeWidth={2} />,
  },
  {
    href: "/memories",
    label: "Özel Günler",
    icon: <Camera size={20} strokeWidth={2} />,
  },
  {
    href: "/calendar",
    label: "Takvim",
    icon: <Calendar size={20} strokeWidth={2} />,
  },
  {
    href: "/daily-notes-user",
    label: "Günlük",
    icon: <BookText size={20} strokeWidth={2} />,
  },
  {
    href: "/letters",
    label: "Mektuplar",
    icon: <Mail size={20} strokeWidth={2} />,
  },
  {
    href: "/photos",
    label: "Fotoğraflar",
    icon: <Images size={20} strokeWidth={2} />,
  },
  {
    href: "/photos/upload",
    label: "Yükle",
    icon: <Upload size={20} strokeWidth={2} />,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <LayoutDashboard size={20} strokeWidth={2} />,
    adminOnly: true,
  },
];

interface BottomNavProps {
  role: "ADMIN" | "USER";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  // Admin rotalarında alt menüyü tamamen gizle
  // Ayrıca admin kullanıcısı için hiçbir zaman alt menü gösterme
  if (role === "ADMIN" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {visibleItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("bottom-nav-item", isActive && "active")}
          >
            <div className="nav-icon relative">
              {item.icon}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-[10px]"
                  style={{
                    background: "rgba(232, 0, 45, 0.15)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
