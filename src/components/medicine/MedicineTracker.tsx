"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateMedicineLogAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Check, X, Clock, Lock, ChevronDown, ChevronUp, Calendar } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  time: string;
}

interface MedicineLog {
  medicine_id: number;
  status: "DRANK" | "MISSED" | "PENDING";
  date: string;
}

interface MedicineTrackerProps {
  medicines: Medicine[];
  todayLogs: MedicineLog[];
  historicalLogs: MedicineLog[];
  userId: number;
}

export function MedicineTracker({ medicines, todayLogs, historicalLogs, userId }: MedicineTrackerProps) {
  const [logs, setLogs] = useState<Record<number, "DRANK" | "MISSED" | "PENDING">>(
    () => {
      const map: Record<number, "DRANK" | "MISSED" | "PENDING"> = {};
      todayLogs.forEach((log) => { map[log.medicine_id] = log.status; });
      medicines.forEach((m) => { if (!map[m.id]) map[m.id] = "PENDING"; });
      return map;
    }
  );
  const [loading, setLoading] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  async function handleMarkDrank(medicineId: number) {
    const current = logs[medicineId];
    // If already DRANK — locked, can't change
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoading(medicineId);
    setLogs((prev) => ({ ...prev, [medicineId]: "DRANK" }));
    const result = await updateMedicineLogAction(medicineId, "DRANK");
    setLoading(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [medicineId]: current }));
    } else {
      toast.success("💊 İlaç alındı olarak işaretlendi!");
    }
  }

  async function handleMarkMissed(medicineId: number) {
    const current = logs[medicineId];
    // If DRANK — locked
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoading(medicineId);
    setLogs((prev) => ({ ...prev, [medicineId]: "MISSED" }));
    const result = await updateMedicineLogAction(medicineId, "MISSED");
    setLoading(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [medicineId]: current }));
    } else {
      toast.error("❌ İlaç alınmadı olarak işaretlendi.");
    }
  }

  const drankCount = Object.values(logs).filter((s) => s === "DRANK").length;
  const missedCount = Object.values(logs).filter((s) => s === "MISSED").length;
  const pendingCount = Object.values(logs).filter((s) => s === "PENDING").length;
  const total = medicines.length;

  // Group historical logs by date
  const historyByDate: Record<string, MedicineLog[]> = {};
  historicalLogs.forEach(log => {
    if (!historyByDate[log.date]) historyByDate[log.date] = [];
    historyByDate[log.date].push(log);
  });
  const historyDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  const getMedName = (id: number) => medicines.find(m => m.id === id)?.name ?? "İlaç";

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Bar */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Toplam", value: total, color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.05)" },
            { label: "Alındı ✓", value: drankCount, color: "#4ade80", bg: "rgba(34,197,94,0.08)" },
            { label: "Bekliyor", value: pendingCount, color: "var(--gs-gold)", bg: "rgba(255,215,0,0.07)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl"
              style={{ background: stat.bg, border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="font-bold text-xl" style={{ color: stat.color }}>{stat.value}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Medicine Cards */}
      {medicines.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-14 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <span className="text-4xl">💊</span>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Bugün için aktif ilaç yok</p>
        </div>
      ) : (
        medicines.map((medicine) => {
          const status = logs[medicine.id] || "PENDING";
          const isDrank = status === "DRANK";
          const isMissed = status === "MISSED";
          const isLocked = isDrank;
          const isLoading = loading === medicine.id;

          return (
            <motion.div
              key={medicine.id}
              layout
              className="rounded-2xl overflow-hidden"
              style={{
                background: isDrank
                  ? "rgba(34,197,94,0.08)"
                  : isMissed
                  ? "rgba(248,113,113,0.06)"
                  : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${isDrank ? "rgba(34,197,94,0.22)" : isMissed ? "rgba(248,113,113,0.18)" : "rgba(255,255,255,0.09)"}`,
                transition: "all 0.3s ease",
              }}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: isDrank ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  {isDrank ? "✅" : isMissed ? "❌" : "💊"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{medicine.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{medicine.time}</span>
                    {isLocked && (
                      <>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                        <Lock size={10} style={{ color: "rgba(34,197,94,0.6)" }} />
                        <span style={{ color: "rgba(34,197,94,0.6)", fontSize: 10, fontWeight: 600 }}>Kilitli</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {isLoading ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: "var(--gs-gold)" }} />
                    </div>
                  ) : isDrank ? (
                    <div
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}
                    >
                      <Check size={14} />
                      <span className="font-semibold text-xs">Alındı</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMarkDrank(medicine.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl font-semibold text-xs transition-all"
                        style={{
                          background: "rgba(34,197,94,0.12)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }}
                      >
                        <Check size={13} />
                        Aldım
                      </button>
                      <button
                        onClick={() => handleMarkMissed(medicine.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl font-semibold text-xs transition-all"
                        style={{
                          background: "rgba(248,113,113,0.10)",
                          color: "#f87171",
                          border: "1px solid rgba(248,113,113,0.18)",
                        }}
                      >
                        <X size={13} />
                        Almadım
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Historical Logs */}
      {historyDates.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <Calendar size={15} />
            Geçmiş Kayıtlar
            {showHistory ? <ChevronUp size={15} className="ml-auto" /> : <ChevronDown size={15} className="ml-auto" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 flex flex-col gap-2"
              >
                {historyDates.map(date => {
                  const dayLogs = historyByDate[date];
                  const allDrank = dayLogs.every(l => l.status === "DRANK");
                  const anyMissed = dayLogs.some(l => l.status === "MISSED");
                  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });

                  return (
                    <div
                      key={date}
                      className="p-3 rounded-xl flex items-center gap-3"
                      style={{
                        background: allDrank ? "rgba(34,197,94,0.06)" : anyMissed ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${allDrank ? "rgba(34,197,94,0.15)" : anyMissed ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{allDrank ? "✅" : anyMissed ? "❌" : "⏳"}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-xs">{dateLabel}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                          {dayLogs.map(l => getMedName(l.medicine_id)).join(", ")}
                        </p>
                      </div>
                      <span
                        className="font-bold text-xs"
                        style={{ color: allDrank ? "#4ade80" : anyMissed ? "#f87171" : "rgba(255,255,255,0.4)" }}
                      >
                        {dayLogs.filter(l => l.status === "DRANK").length}/{dayLogs.length}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
