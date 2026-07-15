"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import { togglePeriodLogAction } from "@/actions/period";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import dayjs from "dayjs";

interface PeriodLog {
  id: string;
  date: string;
}

interface PeriodTrackerClientProps {
  logs: PeriodLog[];
  isOyku: boolean;
}

export function PeriodTrackerClient({ logs, isOyku }: PeriodTrackerClientProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Filter out invalid dates before passing to FullCalendar
  const events = logs
    .filter(log => dayjs(log.date).isValid())
    .map((log) => ({
      id: log.id,
      date: log.date,
      display: "background",
      backgroundColor: "rgba(232, 0, 45, 0.4)",
    }));

  function handleDateClick(info: { dateStr: string }) {
    if (!isOyku) return;

    const date = info.dateStr;
    const exists = logs.some((l) => l.date === date);
    
    if (!exists) {
      const monthLogsCount = logs.filter(l => dayjs(l.date).isSame(dayjs(date), 'month')).length;
      if (monthLogsCount >= 2) {
        toast.error("Bir ay içerisinde en fazla 2 gün seçebilirsiniz.");
        return;
      }
    }

    setSelectedDate(date);
    setIsAdding(!exists);
  }

  async function handleToggle() {
    if (!selectedDate) return;
    
    setLoading(true);
    const result = await togglePeriodLogAction(selectedDate);
    setLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isAdding ? "Regl günü kaydedildi. ❤️" : "Kayıt silindi.");
      setSelectedDate(null);
    }
  }

  return (
    <div className="glass-card p-4 relative">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="tr"
        events={events}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today",
        }}
      />

      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDate(null)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm glass-card p-6 flex flex-col gap-5 text-center"
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)" }}>
                <span className="text-2xl">🩸</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {dayjs(selectedDate).format("DD MMMM YYYY")}
                </h3>
                <p className="text-sm opacity-70">
                  {isAdding ? "Sıkıntılı günler başladı mı?" : "Bu günkü kaydı silmek istediğine emin misin?"}
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  disabled={loading}
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70"
                >
                  <X size={18} className="mx-auto" />
                </button>
                <button
                  disabled={loading}
                  onClick={handleToggle}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all"
                  style={{ background: "var(--gs-red)" }}
                >
                  {loading ? (
                    <span className="opacity-50">İşleniyor...</span>
                  ) : (
                    <>
                      <Check size={18} />
                      {isAdding ? "Evet" : "Kaydı Sil"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
