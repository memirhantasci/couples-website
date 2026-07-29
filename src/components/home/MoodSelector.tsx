"use client";

import { useState } from "react";
import { upsertMoodAction } from "@/actions/notes";
import { toast } from "sonner";

const MOODS = [
  { emoji: "😄", label: "Çok Mutlu" },
  { emoji: "😃", label: "Mutlu" },
  { emoji: "😐", label: "Normal" },
  { emoji: "😢", label: "Üzgün" },
  { emoji: "😣", label: "Kızgın" },
  { emoji: "😔", label: "Yorgun" },
] as const;

interface MoodSelectorProps {
  currentMood?: string | null;
  moodLocked?: boolean;
}

export function MoodSelector({ currentMood, moodLocked = false }: MoodSelectorProps) {
  const [selected, setSelected] = useState<string | null>(currentMood || null);
  const [locked, setLocked] = useState(moodLocked);
  const [loading, setLoading] = useState(false);

  async function handleMoodSelect(emoji: string) {
    if (locked || loading) return;
    setLoading(true);
    const result = await upsertMoodAction(emoji);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      setSelected(emoji);
      setLocked(true);
      toast.success("Ruh halin kaydedildi! " + emoji);
    }
  }

  return (
    <div
      style={{
        background: "#181a20",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <h2 className="text-xl font-bold mb-4" style={{ color: "#ffffff" }}>
        Bugün nasılsın?
      </h2>

      {/* Emoji Row - Fotodaki gibi tek satır ve ekran genişliğine sığacak şekilde */}
      <div className="flex flex-row gap-1.5 w-full">
        {MOODS.map((mood) => {
          const isSelected = selected === mood.emoji;
          return (
            <button
              key={mood.emoji}
              onClick={() => handleMoodSelect(mood.emoji)}
              disabled={loading || locked}
              className="flex-1 flex flex-col items-center justify-center transition-all py-3 px-1"
              style={{
                borderRadius: "12px",
                border: isSelected
                  ? "1px solid #D84257"
                  : "1px solid rgba(255,255,255,0.05)",
                background: isSelected
                  ? "rgba(216, 66, 87, 0.05)"
                  : "rgba(255,255,255,0.03)",
                cursor: locked ? "default" : "pointer",
                opacity: locked && !isSelected ? 0.4 : 1,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: "28px", lineHeight: 1, marginBottom: "4px" }}>{mood.emoji}</span>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                  textAlign: "center",
                  wordBreak: "break-word"
                }}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {locked && selected && (
        <p className="text-[12px] mt-2 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          Bugün için kaydedildi 💛
        </p>
      )}
    </div>
  );
}
