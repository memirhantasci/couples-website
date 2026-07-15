"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCountdown } from "@/lib/date";

import dayjs from "dayjs";
import "dayjs/locale/tr";

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
      <div className="glass-card p-5 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-gradient font-bold text-lg">{title}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>
          Buluşma gerçekleşti!
        </p>
      </div>
    );
  }

  const units = [
    { label: "Gün", value: countdown.days },
    { label: "Saat", value: countdown.hours },
    { label: "Dakika", value: countdown.minutes },
    { label: "Saniye", value: countdown.seconds },
  ];

  const formattedDate = dayjs(targetDate).locale("tr").format("D MMMM dddd, HH:mm");

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📍</span>
        <div>
          <p className="font-bold text-white text-sm">{title}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <motion.div
            key={unit.label}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <motion.span
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold text-gradient"
            >
              {String(unit.value).padStart(2, "0")}
            </motion.span>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
