"use client";

import { useState } from "react";
import { Lock, MailOpen, CalendarClock, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
dayjs.locale("tr");

interface Letter {
  id: number;
  sender_id: number;
  receiver_id?: number;
  title: string;
  content: string;
  unlock_date: string;
  created_at: string;
  sender?: { username: string };
  receiver?: { username: string };
}

export function LetterList({ letters, type = "received" }: { letters: Letter[], type?: "received" | "sent" }) {
  const [openLetterId, setOpenLetterId] = useState<number | null>(null);
  
  const today = dayjs().startOf("day");

  if (!letters.length) {
    return (
      <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dotted rgba(255,255,255,0.1)" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
          {type === "received" ? "Henüz sana yazılmış bir mektup yok." : "Henüz kimseye mektup göndermedin."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {letters.map(letter => {
        const unlockDate = dayjs(letter.unlock_date);
        const isLockedDate = unlockDate.isAfter(today);
        
        // Eğer gelen mektupsa ve tarihi gelmediyse kilitlidir
        // Gönderilen mektuplar her zaman açılabilir
        const canOpen = type === "sent" || !isLockedDate;
        
        const senderName = letter.sender?.username === "emirhan" ? "Emirhan" : letter.sender?.username === "oyku" ? "Öykü" : "Gizli Biri";
        const receiverName = letter.receiver?.username === "emirhan" ? "Emirhan" : letter.receiver?.username === "oyku" ? "Öykü" : "Gizli Biri";
        
        return (
          <div 
            key={letter.id} 
            className="rounded-xl overflow-hidden transition-all"
            style={{
              background: !canOpen ? "rgba(255,255,255,0.02)" : "rgba(255,215,0,0.05)",
              border: `1px solid ${!canOpen ? "rgba(255,255,255,0.05)" : "rgba(255,215,0,0.2)"}`
            }}
          >
            {/* Header (Clickable if unlocked) */}
            <button
              onClick={() => canOpen && setOpenLetterId(openLetterId === letter.id ? null : letter.id)}
              disabled={!canOpen}
              className="w-full p-4 flex items-center justify-between text-left transition-colors"
              style={{
                cursor: !canOpen ? "not-allowed" : "pointer",
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: !canOpen ? "rgba(255,255,255,0.05)" : "rgba(255,215,0,0.15)",
                    color: !canOpen ? "rgba(255,255,255,0.4)" : "var(--gs-gold)"
                  }}
                >
                  {!canOpen ? <Lock size={18} /> : <MailOpen size={18} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {letter.title}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
                    {type === "received" ? `Kimden: ${senderName}` : `Kime: ${receiverName}`}
                  </p>
                </div>
              </div>

              {!canOpen ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold mb-1" style={{ color: "var(--gs-red)" }}>Kilitli</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <CalendarClock size={12} />
                    {unlockDate.format("DD MMM YYYY")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {type === "sent" && isLockedDate && (
                    <div className="flex flex-col items-end mr-2 hidden sm:flex">
                      <span className="text-xs font-semibold mb-1" style={{ color: "var(--gs-gold)" }}>Alıcıya Kilitli</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <CalendarClock size={12} />
                        {unlockDate.format("DD MMM")}
                      </span>
                    </div>
                  )}
                  <div style={{ color: "rgba(255,255,255,0.4)", transform: openLetterId === letter.id ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              )}
            </button>

            {/* Content Body */}
            {canOpen && openLetterId === letter.id && (
              <div className="p-4 pt-2 border-t" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
                <div className="p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
                  <p className="whitespace-pre-wrap text-white leading-relaxed text-sm" style={{ opacity: 0.9 }}>
                    {letter.content}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-xs italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {type === "received" ? "Yazılma Tarihi:" : "Gönderilme Tarihi:"} {dayjs(letter.created_at).format("DD MMMM YYYY")}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
