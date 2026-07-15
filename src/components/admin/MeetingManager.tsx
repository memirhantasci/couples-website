"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMeetingAction, deactivateMeetingAction } from "@/actions/meetings";
import { toast } from "sonner";
import { Plus, X, CalendarClock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Meeting {
  id: number;
  meeting_datetime: string;
  title: string | null;
  is_active: boolean;
}

interface MeetingManagerProps {
  activeMeeting: Meeting | null;
}

export function MeetingManager({ activeMeeting }: MeetingManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const initialState: { error?: string; success?: boolean } = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMeetingAction(prev, formData);
      if (result.success) {
        toast.success("Buluşma eklendi! 📍");
        setIsOpen(false);
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  async function handleDeactivate() {
    if (!activeMeeting) return;
    setDeactivating(true);
    const result = await deactivateMeetingAction(activeMeeting.id);
    setDeactivating(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Buluşma iptal edildi.");
  }

  // Min datetime: now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CalendarClock size={18} style={{ color: "var(--gs-gold)" }} />
        <h3 className="font-bold text-white text-sm">Buluşma Yönetimi</h3>
      </div>

      {activeMeeting ? (
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.15)",
          }}
        >
          <div>
            <p className="font-semibold text-white text-sm">
              {activeMeeting.title || "Buluşma"}
            </p>
            <p style={{ color: "rgba(255,215,0,0.8)", fontSize: 12 }}>
              {new Date(activeMeeting.meeting_datetime).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={handleDeactivate}
            disabled={deactivating}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: "rgba(232,0,45,0.12)",
              color: "rgba(232,0,45,0.8)",
              border: "1px solid rgba(232,0,45,0.2)",
            }}
          >
            <Trash2 size={13} />
            İptal
          </button>
        </div>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
          Aktif buluşma yok
        </p>
      )}

      <button onClick={() => setIsOpen(true)} className="btn-gold w-full">
        <Plus size={16} />
        {activeMeeting ? "Yeni Buluşma Ekle" : "Buluşma Planla"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-4 right-4 z-50 glass-card p-5"
              style={{ top: "50%", transform: "translateY(-50%)", maxWidth: 440, margin: "0 auto" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Buluşma Planla</h3>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>

              <form action={formAction} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Başlık (isteğe bağlı)
                  </label>
                  <input name="title" type="text" placeholder="ör: Akşam yemeği 🍕" className="input-glass" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Tarih & Saat
                  </label>
                  <input name="meeting_datetime" type="datetime-local" min={minDateTime} required className="input-glass" />
                </div>
                <button type="submit" disabled={isPending} className="btn-gold w-full">
                  {isPending ? <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> : <><Plus size={16} /> Ekle</>}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
