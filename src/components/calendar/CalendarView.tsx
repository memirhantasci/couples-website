"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import { upsertCalendarNoteAction, deleteCalendarNoteAction } from "@/actions/meetings";
import { toast } from "sonner";
import { X, Trash2, Save, Calendar as CalendarIcon } from "lucide-react";

interface CalendarNote {
  id: number;
  date: string;
  note: string;
  user?: { username: string; display_name?: string };
}

interface Mood {
  date: string;
  mood_type: string;
}

interface CalendarViewProps {
  notes: CalendarNote[];
  moods: Mood[];
  currentUsername: string;
  photoDates?: string[];
  disableNotes?: boolean;
}

export function CalendarView({
  notes,
  moods,
  currentUsername,
  photoDates = [],
  disableNotes = false,
}: CalendarViewProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [existingNote, setExistingNote] = useState<CalendarNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build events from notes and moods
  const noteEvents = notes.map((n) => {
    const displayName = n.user?.display_name || n.user?.username;
    const namePrefix = displayName ? `(${displayName}) ` : "";
    return {
      id: `note-${n.id}`,
      date: n.date,
      title: "📝 " + namePrefix + n.note.substring(0, 20) + (n.note.length > 20 ? "…" : ""),
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

  const photoEvents = photoDates.map((date) => ({
    id: `photo-${date}`,
    date,
    title: "📷",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    textColor: "#22c55e",
    extendedProps: { type: "photo", photoDate: date },
  }));

  const allEvents = [...noteEvents, ...moodEvents, ...photoEvents];

  function openDateModal(date: string) {
    if (disableNotes) {
      if (photoDates.includes(date)) {
        router.push(`/photos/${date}`);
      }
      return;
    }
    const existing = notes.find(
      (n) => n.date === date && n.user?.username === currentUsername
    );
    setExistingNote(existing || null);
    setNoteText(existing?.note || "");
    setSelectedDate(date);
  }

  function handleDateClick(info: { dateStr: string }) {
    openDateModal(info.dateStr);
  }

  function handleEventClick(info: { event: any }) {
    const type = info.event.extendedProps.type;
    if (type === "photo") {
      router.push(`/photos/${info.event.extendedProps.photoDate}`);
      return;
    }
    // For note and mood events, open the note modal for that date
    const date = info.event.startStr.split("T")[0];
    openDateModal(date);
  }

  function closeModal() {
    setSelectedDate(null);
    setNoteText("");
    setExistingNote(null);
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
      closeModal();
      router.refresh();
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
      closeModal();
      router.refresh();
    }
  }

  // If no existingNote, the current user is always the "owner" (can write)
  // If there IS an existing note, only the owner can edit
  const isOwner = !existingNote || existingNote.user?.username === currentUsername;

  return (
    <>
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
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedDate && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  style={{ zIndex: 9998 }}
                  onClick={closeModal}
                />

                {/* Modal */}
                <div
                  className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                  style={{ zIndex: 9999 }}
                >
                  <motion.div
                    key="modal"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md glass-card p-5 relative pointer-events-auto"
                  >
                    {/* Close button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all text-white/50 hover:text-white"
                    >
                      <X size={16} />
                    </button>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CalendarIcon size={20} style={{ color: "var(--gs-red)" }} />
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>

                    <div className="flex flex-col gap-4">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder={isOwner ? "Bu güne dair bir not bırak..." : "Not..."}
                        className="w-full p-4 rounded-xl text-sm resize-none h-32"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "white",
                          outline: "none",
                        }}
                        readOnly={!isOwner}
                        autoFocus
                      />

                      {isOwner && (
                        <div className="flex gap-3">
                          {existingNote && (
                            <button
                              onClick={handleDelete}
                              disabled={loading}
                              className="p-3 rounded-xl hover:bg-white/10 transition-all text-white/50 hover:text-red-400"
                              title="Notu Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <button
                            onClick={handleSave}
                            disabled={loading || !noteText.trim()}
                            className="flex-1 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            style={{
                              background:
                                loading || !noteText.trim()
                                  ? "rgba(255,255,255,0.1)"
                                  : "var(--gs-red)",
                              color:
                                loading || !noteText.trim()
                                  ? "rgba(255,255,255,0.3)"
                                  : "white",
                            }}
                          >
                            {loading ? (
                              "Kaydediliyor..."
                            ) : (
                              <>
                                <Save size={18} />
                                {existingNote ? "Güncelle" : "Kaydet"}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
