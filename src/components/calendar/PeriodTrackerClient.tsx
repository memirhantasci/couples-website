"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { togglePeriodLogAction } from "@/actions/period";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    console.log("👉 handleDateClick tetiklendi! Gelen tarih:", info.dateStr);
    console.log("👉 isOyku yetkisi açık mı? (Şu an iptal edildiği için her türlü geçmeli):", isOyku);
    
    if (!isOyku) {
      toast.error("Bu tabloyu sadece Öykü güncelleyebilir.");
      return;
    }

    const date = info.dateStr;
    const exists = logs.some((l) => l.date === date);
    console.log("👉 Bu tarihte kayıt var mı?", exists);
    
    if (!exists) {
      const monthLogsCount = logs.filter(l => dayjs(l.date).isSame(dayjs(date), 'month')).length;
      console.log("👉 Bu ayki kayıt sayısı:", monthLogsCount);
      
      if (monthLogsCount >= 2) {
        console.log("🚫 Ayda 2'den fazla kayıt eklenemez, işlem iptal ediliyor.");
        toast.error("Bir ay içerisinde en fazla 2 gün seçebilirsiniz.");
        return;
      }
    }

    console.log("✅ Her şey tamam, setSelectedDate çalıştırılıyor:", date);
    setSelectedDate(date);
    setIsAdding(!exists);
  }

  function handleEventClick(info: any) {
    const dateStr = info.event.startStr.split('T')[0] || info.event.startStr;
    console.log("👉 handleEventClick tetiklendi! Gelen tarih:", dateStr);
    handleDateClick({ dateStr });
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
    <>
      <div className="glass-card p-4 relative">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="tr"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "today",
          }}
        />
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        selectedDate ? (
          <div 
            style={{ 
              position: "fixed", 
              top: 0, 
              left: 0, 
              width: "100vw", 
              height: "100vh", 
              zIndex: 999999, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "1rem"
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setSelectedDate(null)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(2px)",
                cursor: "pointer"
              }}
            />
            
            {/* Modal Box */}
            <div
              className="glass-card"
              style={{ 
                position: "relative",
                width: "100%",
                maxWidth: "24rem",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "1rem"
              }}
            >
              <div 
                style={{ 
                  width: "4rem", 
                  height: "4rem", 
                  borderRadius: "9999px", 
                  margin: "0 auto", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)" 
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🩸</span>
              </div>
              
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.25rem", color: "white" }}>
                  {dayjs(selectedDate).format("DD MMMM YYYY")}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                  {isAdding ? "Sıkıntılı günler başladı mı?" : "Bu günkü kaydı silmek istediğine emin misin?"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  disabled={loading}
                  onClick={() => setSelectedDate(null)}
                  style={{
                    flex: "1",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    fontWeight: "600",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <X size={18} />
                </button>
                <button
                  disabled={loading}
                  onClick={handleToggle}
                  style={{
                    flex: "2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: "var(--gs-red)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    cursor: "pointer"
                  }}
                >
                  {loading ? (
                    <span style={{ opacity: 0.5 }}>İşleniyor...</span>
                  ) : (
                    <>
                      <Check size={18} />
                      {isAdding ? "Evet" : "Kaydı Sil"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </>
  );
}
