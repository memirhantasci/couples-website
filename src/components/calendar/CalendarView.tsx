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
  const [partnerNote, setPartnerNote] = useState<CalendarNote | null>(null);
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
    const existing = notes.find((n) => {
      const u = Array.isArray(n.user) ? n.user[0] : n.user;
      return n.date === date && u?.username?.toLowerCase() === currentUsername?.toLowerCase();
    });
    const partner = notes.find((n) => {
      const u = Array.isArray(n.user) ? n.user[0] : n.user;
      return n.date === date && u?.username?.toLowerCase() !== currentUsername?.toLowerCase();
    });
    setExistingNote(existing || null);
    setPartnerNote(partner || null);
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
    setPartnerNote(null);
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

  const existingUser = existingNote ? (Array.isArray(existingNote.user) ? existingNote.user[0] : existingNote.user) : null;
  const isOwner = !existingNote || existingUser?.username?.toLowerCase() === currentUsername?.toLowerCase();

  const modal = selectedDate ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.70)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={closeModal}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--surface-2)",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={16} />
        </button>

        <h3
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CalendarIcon size={20} style={{ color: "var(--gs-red)" }} />
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>

        {partnerNote && (() => {
          const pu = Array.isArray(partnerNote.user) ? partnerNote.user[0] : partnerNote.user;
          return (
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--gs-gold)" }}>
                {pu?.display_name || pu?.username}
              </span>
              <div
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(255,215,0,0.05)",
                  border: "1px solid rgba(255,215,0,0.15)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {partnerNote.note}
              </div>
            </div>
          );
        })()}

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={isOwner ? "Bu güne dair bir not bırak..." : "Not..."}
          readOnly={!isOwner}
          autoFocus
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "14px",
            borderRadius: "14px",
            background: "var(--surface-1)",
            border: "1.5px solid var(--border-default)",
            color: "var(--text-primary)",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
        />

        {isOwner && (
          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            {existingNote && (
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,100,100,0.8)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                title="Notu Sil"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading || !noteText.trim()}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                background:
                  loading || !noteText.trim()
                    ? "rgba(255,255,255,0.1)"
                    : "var(--gs-red)",
                color:
                  loading || !noteText.trim() ? "rgba(255,255,255,0.3)" : "white",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: loading || !noteText.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Save size={18} />
              {loading ? "Kaydediliyor..." : existingNote ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="card p-4">
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

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
