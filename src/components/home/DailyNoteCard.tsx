"use client";

import { useState } from "react";
import { upsertDailyNoteAction } from "@/actions/notes";
import { BookOpen, Lock, Send } from "lucide-react";
import { toast } from "sonner";

interface DailyNoteCardProps {
  existingNote?: string | null;
}

export function DailyNoteCard({ existingNote }: DailyNoteCardProps) {
  const [isEditing, setIsEditing] = useState(!existingNote);
  const [content, setContent] = useState(existingNote || "");
  const [saved, setSaved] = useState(!!existingNote);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saved) return; // already saved today — locked
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await upsertDailyNoteAction({}, formData);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Notun kaydedildi! 📝");
      setIsEditing(false);
      setSaved(true);
    }
  }

  return (
    <div className="glass-card" style={{ padding: "22px 20px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: "var(--gs-gold)" }} />
          <span className="font-semibold text-sm text-white">Günlük Notum</span>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Lock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>
              Bugün için kaydedildi
            </span>
          </div>
        )}
      </div>

      {saved ? (
        /* Read-only display */
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.12)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.80)", whiteSpace: "pre-wrap" }}
          >
            {content}
          </p>
          <p
            className="text-xs mt-3"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Yarın yeni bir not yazabilirsin 🌙
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bugün nasıldı? Ne hissediyorsun?..."
            rows={4}
            className="input-glass resize-none"
            maxLength={2000}
            required
          />
          <div className="flex items-center justify-between">
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: "10px 20px", fontSize: 13 }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
