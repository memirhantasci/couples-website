"use client";

import { Lock, Mail } from "lucide-react";
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

  // Only show locked letters
  const pendingLetters = letters.filter(letter => {
    const unlockDate = dayjs(letter.unlock_date);
    return unlockDate.isAfter(today);
  });

  if (pendingLetters.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-2">
      <h2 className="font-bold text-white text-base flex items-center gap-2">
        <Lock size={18} style={{ color: "var(--gs-gold)" }} />
        Bekleyen Mektuplar
      </h2>
      <div className="flex flex-col gap-3">
        {pendingLetters.map(letter => {
          const unlockDate = dayjs(letter.unlock_date);
          const daysLeft = unlockDate.diff(today, "day");
          const senderName = letter.sender?.display_name || letter.sender?.username || "Bilinmeyen";

          return (
            <div
              key={letter.id}
              className="glass-card p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.02) 100%)",
                border: "1px solid rgba(255,215,0,0.15)",
                borderLeft: "3px solid var(--gs-gold)"
              }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,215,0,0.1)", color: "var(--gs-gold)" }}
              >
                <Mail size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base truncate">
                  Kimden: {senderName}
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>
                  Açılacak Tarih: {unlockDate.format("DD MMMM YYYY")}
                </p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xl font-bold" style={{ color: "var(--gs-gold)" }}>
                  {daysLeft}
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>
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
