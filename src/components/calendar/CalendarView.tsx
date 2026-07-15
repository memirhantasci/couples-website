"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import { upsertCalendarNoteAction, deleteCalendarNoteAction } from "@/actions/meetings";
import { toast } from "sonner";
import { X, Trash2, Save } from "lucide-react";

interface CalendarNote {
  id: number;
  date: string;
  note: string;
  user?: { username: string };
}

interface Mood {
  date: string;
  mood_type: string;
}

interface CalendarViewProps {
  notes: CalendarNote[];
  moods: Mood[];
}

export function CalendarView({ notes, moods }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [existingNote, setExistingNote] = useState<CalendarNote | null>(null);
  const [loading, setLoading] = useState(false);

  // Build events from notes and moods
  const noteEvents = notes.map((n) => {
    const username = n.user?.username ? `(${n.user.username}) ` : "";
    return {
      id: `note-${n.id}`,
      date: n.date,
      title: "📝 " + username + n.note.substring(0, 20) + (n.note.length > 20 ? "…" : ""),
      backgroundColor: "rgba(232, 0, 45, 0.15)",
      borderColor: "rgba(232, 0, 45, 0.3)",
      textColor: "#ff6b6b",
      extendedProps: { type: "note", noteId: n.id },
    };
  });

  const moodEvents = moods.map((m) => ({
    id: `mood-${m.date}`,
    date: m.date,
    title: m.mood_type,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderColor: "rgba(255, 215, 0, 0.2)",
    textColor: "#FFD700",
    extendedProps: { type: "mood" },
  }));

  const allEvents = [...noteEvents, ...moodEvents];

  function handleDateClick(info: { dateStr: string }) {
    const date = info.dateStr;
    setSelectedDate(date);
    const existing = notes.find((n) => n.date === date);
    setExistingNote(existing || null);
    setNoteText(existing?.note || "");
  }

  function handleEventClick(info: { event: any }) {
    if (info.event.extendedProps.type === "note") {
      const date = info.event.startStr.split("T")[0]; // YYYY-MM-DD
      setSelectedDate(date);
      const existing = notes.find((n) => n.date === date);
      setExistingNote(existing || null);
      setNoteText(existing?.note || "");
    }
  }

  async function handleSave() {
    if (!selectedDate || !noteText.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("date", selectedDate);
    fd.append("note", noteText.trim());
    const result = await upsertCalendarNoteAction({}, fd);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Not kaydedildi! 📅");
      setSelectedDate(null);
    }
  }

  async function handleDelete() {
    if (!existingNote) return;
    setLoading(true);
    const result = await deleteCalendarNoteAction(existingNote.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Not silindi.");
      setSelectedDate(null);
    }
  }

  return (
    <div className="glass-card p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="tr"
        events={allEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        dayMaxEvents={2}
        eventDisplay="block"
      />

      {/* Note Dialog */}
      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-4 right-4 z-50 glass-card p-5"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg transition-all"
                  style={{ background: "rgba(232,0,45,0.15)", color: "rgba(232,0,45,0.9)", border: "1px solid rgba(232,0,45,0.2)", minWidth: 40, minHeight: 40 }}
                >
                  ✕
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Bu güne not ekle..."
                rows={4}
                className="resize-none mb-4"
                maxLength={500}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.10)",
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  borderRadius: 14,
                  color: "#ffffff",
                  fontSize: 15,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !noteText.trim()}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      Kaydet
                    </>
                  )}
                </button>
                {existingNote && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn-secondary px-4"
                    style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
