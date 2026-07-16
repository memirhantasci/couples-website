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
  sender?: { username: string; display_name?: string };
  receiver?: { username: string; display_name?: string };
}

export function LetterList({ letters, type = "received" }: { letters: Letter[], type?: "received" | "sent" }) {
  const [openLetterId, setOpenLetterId] = useState<number | null>(null);

  const today = dayjs().startOf("day");

  if (!letters.length) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{ background: "var(--surface-2)", border: "1px dashed rgba(255,255,255,0.1)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          {type === "received" ? "Henüz sana yazılmış bir mektup yok." : "Henüz kimseye mektup göndermedin."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {letters.map(letter => {
        const unlockDate = dayjs(letter.unlock_date);
        const isLockedDate = unlockDate.isAfter(today);
        const canOpen = type === "sent" || !isLockedDate;
        const isOpen = openLetterId === letter.id;

        const senderName = letter.sender?.display_name || letter.sender?.username || "Bilinmeyen";
        const receiverName = letter.receiver?.display_name || letter.receiver?.username || "Bilinmeyen";

        return (
          <div
            key={letter.id}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${isOpen ? "rgba(245,200,66,0.25)" : "var(--border-subtle)"}`,
              boxShadow: isOpen ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
            }}
          >
            {/* Header (Clickable if unlocked) */}
            <button
              onClick={() => canOpen && setOpenLetterId(isOpen ? null : letter.id)}
              disabled={!canOpen}
              className="w-full p-4 flex items-center justify-between text-left transition-colors"
              style={{
                cursor: !canOpen ? "not-allowed" : "pointer",
                background: isOpen ? "rgba(245,200,66,0.04)" : "transparent",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: !canOpen
                      ? "rgba(255,255,255,0.06)"
                      : isOpen
                        ? "rgba(245,200,66,0.14)"
                        : "rgba(245,200,66,0.10)",
                    color: !canOpen ? "var(--text-tertiary)" : "var(--gs-gold)",
                  }}
                >
                  {!canOpen ? <Lock size={17} /> : <MailOpen size={17} />}
                </div>

                {/* Title & sender */}
                <div className="min-w-0">
                  <h4
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {letter.title}
                  </h4>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                    {type === "received" ? `Kimden: ${senderName}` : `Kime: ${receiverName}`}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {!canOpen ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="badge badge-red text-[10px] py-0.5 px-2">Kilitli</span>
                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <CalendarClock size={10} />
                      {unlockDate.format("DD MMM YYYY")}
                    </span>
                  </div>
                ) : (
                  <>
                    {type === "sent" && isLockedDate && (
                      <span className="badge badge-gold text-[10px] py-0.5 px-2 hidden sm:inline-flex">
                        Alıcıya Kilitli
                      </span>
                    )}
                    <div
                      style={{
                        color: "var(--text-tertiary)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </>
                )}
              </div>
            </button>

            {/* Content Body */}
            {canOpen && isOpen && (
              <div
                className="px-4 pb-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="p-4 rounded-xl mt-4"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <p
                    className="whitespace-pre-wrap leading-relaxed text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {letter.content}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>
                    {type === "received" ? "Yazılma Tarihi:" : "Gönderilme Tarihi:"}{" "}
                    {dayjs(letter.created_at).format("DD MMMM YYYY")}
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
