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

  const selectedMoodLabel = MOODS.find(m => m.emoji === selected)?.label;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: 20 }}>💭</span>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Bugün nasılsın?
          </span>
        </div>
        {locked && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
          >
            <Lock size={10} style={{ color: "var(--text-tertiary)" }} />
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
              Bugün için kaydedildi
            </span>
          </div>
        )}
      </div>

      {locked && selected ? (
        /* Locked / show-only state */
        <div
          className="flex items-center gap-4 p-4 rounded-[14px]"
          style={{
            background: "rgba(245,200,66,0.07)",
            border: "1px solid rgba(245,200,66,0.14)",
          }}
        >
          <span style={{ fontSize: 44, lineHeight: 1 }}>{selected}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {selectedMoodLabel}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
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
                opacity: locked ? 0.45 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              <span>{mood.emoji}</span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-tertiary)",
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
