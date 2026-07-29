"use client";

import { useState } from "react";
import { upsertDailyNoteAction } from "@/actions/notes";
import { toast } from "sonner";

interface DailyNoteCardProps {
  existingNote?: string | null;
}

export function DailyNoteCard({ existingNote }: DailyNoteCardProps) {
  const [content, setContent] = useState(existingNote || "");
  const [saved, setSaved] = useState(!!existingNote);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saved) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await upsertDailyNoteAction({}, formData);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Notun kaydedildi! 📝");
      setSaved(true);
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
        Günlük Notum
      </h2>

      {saved ? (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}
          >
            {content}
          </p>
          <p className="text-[12px] mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Yarın yeni bir not yazabilirsin 🌙
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bugün nasıldı? Ne hissediyorsun?..."
            rows={4}
            className="w-full resize-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "15px",
              lineHeight: 1.6,
              padding: "16px",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease",
            }}
            maxLength={2000}
            required
          />
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center font-bold text-[15px] transition-all"
            style={{
              background: "#D84257",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      )}
    </div>
  );
}
