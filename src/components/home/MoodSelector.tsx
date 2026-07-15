"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { upsertMoodAction } from "@/actions/notes";
import { toast } from "sonner";

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
}

export function MoodSelector({ currentMood }: MoodSelectorProps) {
  const [selected, setSelected] = useState<string | null>(currentMood || null);
  const [loading, setLoading] = useState(false);

  async function handleMoodSelect(emoji: string) {
    if (loading) return;
    setLoading(true);
    setSelected(emoji);

    const result = await upsertMoodAction(emoji);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      setSelected(currentMood || null);
    } else {
      toast.success("Ruh halin kaydedildi! " + emoji);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💭</span>
        <span className="font-semibold text-sm text-white">Bugün nasılsın?</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.emoji}
            onClick={() => handleMoodSelect(mood.emoji)}
            disabled={loading}
            className={`mood-btn ${selected === mood.emoji ? "selected" : ""}`}
          >
            <span>{mood.emoji}</span>
            <span
              style={{
                fontSize: 10,
                color:
                  selected === mood.emoji
                    ? "var(--gs-gold)"
                    : "rgba(255,255,255,0.4)",
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
    </div>
  );
}
