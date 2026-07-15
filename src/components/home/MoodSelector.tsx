"use client";

import { useState } from "react";
import { upsertMoodAction } from "@/actions/notes";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const MOODS = [
  { emoji: "😍", label: "Çok mutluyum" },
  { emoji: "😊", label: "İyiyim" },
  { emoji: "😐", label: "Normalim" },
  { emoji: "😔", label: "Biraz kötüyüm" },
  { emoji: "😢", label: "Moralim bozuk" },
  { emoji: "😴", label: "Yorgunum" },
] as const;

interface MoodSelectorProps {
  currentMood?: string | null;
  moodLocked?: boolean; // true if already set today
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
      setLocked(true); // lock after first selection
      toast.success("Ruh halin kaydedildi! " + emoji);
    }
  }

  const selectedMoodLabel = MOODS.find(m => m.emoji === selected)?.label;

  return (
    <div className="glass-card" style={{ padding: "22px 20px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>💭</span>
          <span className="font-semibold text-sm text-white">Bugün nasılsın?</span>
        </div>
        {locked && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Lock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>Bugün için kaydedildi</span>
          </div>
        )}
      </div>

      {locked && selected ? (
        /* Show locked state nicely */
        <div
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.15)",
          }}
        >
          <span style={{ fontSize: 48 }}>{selected}</span>
          <div>
            <p className="font-bold text-white text-base">{selectedMoodLabel}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              Yarın tekrar seçebilirsin 🌙
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => handleMoodSelect(mood.emoji)}
              disabled={loading || locked}
              className="mood-btn"
              style={{
                opacity: locked ? 0.5 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <span>{mood.emoji}</span>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
