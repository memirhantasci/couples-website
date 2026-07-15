"use client";

import { useState } from "react";
import { MailOpen, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
dayjs.locale("tr");

interface Letter {
  id: number;
  sender_id: number;
  receiver_id: number;
  title: string;
  content: string;
  unlock_date: string;
  created_at: string;
  sender?: { username: string };
  receiver?: { username: string };
}

export function AdminLetterList({ letters }: { letters: Letter[] }) {
  const [openLetterId, setOpenLetterId] = useState<number | null>(null);

  if (!letters.length) {
    return (
      <div className="p-4 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dotted rgba(255,255,255,0.1)" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
          Sistemde henüz hiç mektup yok.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {letters.map(letter => {
        const senderName = letter.sender?.username === "emirhan" ? "Emirhan" : letter.sender?.username === "oyku" ? "Öykü" : letter.sender?.username || "Gizli Biri";
        const receiverName = letter.receiver?.username === "emirhan" ? "Emirhan" : letter.receiver?.username === "oyku" ? "Öykü" : letter.receiver?.username || "Bilinmiyor";
        
        return (
          <div 
            key={letter.id} 
            className="rounded-xl overflow-hidden transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {/* Header (Always Clickable) */}
            <button
              onClick={() => setOpenLetterId(openLetterId === letter.id ? null : letter.id)}
              className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                >
                  <MailOpen size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {letter.title}
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
                    {senderName} ➔ {receiverName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2 hidden sm:block">
                  <p className="text-xs text-white/50 mb-1">Açılış Tarihi</p>
                  <p className="text-xs text-white/80 font-mono">{dayjs(letter.unlock_date).format("DD MMM YYYY")}</p>
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", transform: openLetterId === letter.id ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </button>

            {/* Content Body */}
            {openLetterId === letter.id && (
              <div className="p-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <p className="whitespace-pre-wrap text-white leading-relaxed text-sm" style={{ opacity: 0.9 }}>
                    {letter.content}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-xs italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Yazılma Tarihi: {dayjs(letter.created_at).format("DD MMMM YYYY HH:mm")}
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
