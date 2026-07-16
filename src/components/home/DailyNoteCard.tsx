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
    if (saved) return;
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
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: "rgba(245,200,66,0.12)", color: "var(--gs-gold)" }}
          >
            <BookOpen size={16} />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Günlük Notum
          </span>
        </div>

        {saved && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Lock size={10} style={{ color: "var(--text-tertiary)" }} />
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
              Bugün için kaydedildi
            </span>
          </div>
        )}
      </div>

      {saved ? (
        /* Read-only display */
        <div
          className="p-4 rounded-[14px]"
          style={{
            background: "rgba(245,200,66,0.05)",
            border: "1px solid rgba(245,200,66,0.12)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}
          >
            {content}
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>
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
            style={{ borderRadius: 14, lineHeight: 1.6 }}
            maxLength={2000}
            required
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {content.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: "10px 18px", fontSize: 13, borderRadius: 12 }}
            >
              {submitting ? (
                <div
                  className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.25)", borderTopColor: "white" }}
                />
              ) : (
                <>
                  <Send size={13} />
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
