"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCountdown, dayjs } from "@/lib/date";
import { MapPin } from "lucide-react";

interface CountdownProps {
  targetDate: string;
  title: string;
}

export function MeetingCountdown({ targetDate, title }: CountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (countdown.isPast) {
    return (
      <div className="card p-5 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-gradient font-bold text-lg">{title}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          Buluşma gerçekleşti!
        </p>
      </div>
    );
  }

  const units = [
    { label: "Gün",    value: countdown.days },
    { label: "Saat",   value: countdown.hours },
    { label: "Dakika", value: countdown.minutes },
    { label: "Saniye", value: countdown.seconds },
  ];

  const formattedDate = dayjs(targetDate).locale("tr").format("D MMMM dddd, HH:mm");

  return (
    <div className="card p-5">
      {/* Title row */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
        >
          <MapPin size={16} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{formattedDate}</p>
        </div>
      </div>

      {/* Countdown grid */}
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center gap-1.5 py-3 rounded-[14px]"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <motion.span
              key={unit.value}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-2xl font-bold"
              style={{ color: "var(--gs-red)", fontVariantNumeric: "tabular-nums" }}
            >
              {String(unit.value).padStart(2, "0")}
            </motion.span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
