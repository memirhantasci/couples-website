"use client";

import { useState } from "react";
import { useActionState } from "react";
import { upsertDailyNoteAction } from "@/actions/notes";
import { motion } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import { toast } from "sonner";

interface DailyNoteCardProps {
  existingNote?: string | null;
}

export function DailyNoteCard({ existingNote }: DailyNoteCardProps) {
  const [isEditing, setIsEditing] = useState(!existingNote);
  const [content, setContent] = useState(existingNote || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await upsertDailyNoteAction({}, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Notun kaydedildi! 📝");
      setIsEditing(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: "var(--gs-gold)" }} />
          <span className="font-semibold text-sm text-white">Günlük Notum</span>
        </div>
        {existingNote && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold"
            style={{ color: "var(--gs-red)" }}
          >
            Düzenle
          </button>
        )}
      </div>

      {isEditing ? (
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
            <button type="submit" className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
              <Send size={14} />
              Kaydet
            </button>
          </div>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {existingNote}
        </motion.div>
      )}
    </div>
  );
}
