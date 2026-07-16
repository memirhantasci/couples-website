"use client";

import { Lock, Mail, CalendarClock } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
dayjs.locale("tr");

interface PendingLetter {
  id: number;
  unlock_date: string;
  sender?: { display_name?: string; username: string };
}

export function PendingLettersCard({ letters }: { letters: PendingLetter[] }) {
  if (!letters || letters.length === 0) return null;

  const today = dayjs().startOf("day");

  const pendingLetters = letters.filter(letter => {
    const unlockDate = dayjs(letter.unlock_date);
    return !unlockDate.isBefore(today, "day");
  });

  if (pendingLetters.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="section-title flex items-center gap-2">
        <Lock size={16} style={{ color: "var(--gs-gold)" }} />
        Bekleyen Mektuplar
      </h2>
      <div className="flex flex-col gap-2">
        {pendingLetters.map(letter => {
          const unlockDate = dayjs(letter.unlock_date);
          const daysLeft = unlockDate.diff(today, "day");
          const senderName = letter.sender?.display_name || letter.sender?.username || "Bilinmeyen";

          return (
            <div
              key={letter.id}
              className="flex items-center gap-4 p-4 rounded-[16px] transition-all"
              style={{
                background: "rgba(245,200,66,0.05)",
                border: "1px solid rgba(245,200,66,0.14)",
                borderLeft: "3px solid var(--gs-gold)",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(245,200,66,0.12)", color: "var(--gs-gold)" }}
              >
                <Mail size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  Kimden: {senderName}
                </p>
                <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  <CalendarClock size={10} />
                  {unlockDate.format("DD MMMM YYYY")}
                </p>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-lg font-bold" style={{ color: "var(--gs-gold)" }}>
                  {daysLeft}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  gün kaldı
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
