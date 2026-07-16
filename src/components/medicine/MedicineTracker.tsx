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
    <div className="flex flex-col gap-3">
      {/* Summary Bar */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Toplam",   value: total,        color: "var(--text-secondary)", bg: "var(--surface-3)" },
            { label: "Alındı",   value: drankCount,   color: "#4ade80", bg: "rgba(34,197,94,0.09)" },
            { label: "Bekliyor", value: pendingCount,  color: "var(--gs-gold)", bg: "rgba(245,200,66,0.08)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-3 rounded-[14px]"
              style={{ background: stat.bg, border: "1px solid var(--border-subtle)" }}
            >
              <span className="font-bold text-xl" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Medicine Cards */}
      {medicines.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-14 rounded-[20px]"
          style={{ background: "var(--surface-2)", border: "1px dashed var(--border-default)" }}
        >
          <span className="text-4xl">💊</span>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Bugün için aktif ilaç yok
          </p>
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
              className="rounded-[18px] overflow-hidden"
              style={{
                background: isDrank
                  ? "rgba(34,197,94,0.07)"
                  : isMissed
                    ? "rgba(248,113,113,0.06)"
                    : "var(--surface-2)",
                border: `1.5px solid ${isDrank
                  ? "rgba(34,197,94,0.20)"
                  : isMissed
                    ? "rgba(248,113,113,0.16)"
                    : "var(--border-default)"}`,
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div className="flex flex-col p-4">
                {/* Top: icon + info */}
                <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: isDrank
                        ? "rgba(34,197,94,0.14)"
                        : isMissed
                          ? "rgba(248,113,113,0.10)"
                          : "var(--surface-3)",
                    }}
                  >
                    {isDrank ? "✅" : isMissed ? "❌" : "💊"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {medicine.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {medicine.time}
                      </span>
                      {isLocked && (
                        <>
                          <span style={{ color: "var(--border-default)", margin: "0 2px" }}>•</span>
                          <Lock size={11} style={{ color: "rgba(34,197,94,0.7)" }} />
                          <span className="text-[11px] font-semibold" style={{ color: "rgba(34,197,94,0.7)" }}>
                            Kilitli
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  {isLoading ? (
                    <div
                      className="col-span-2 py-4 flex items-center justify-center rounded-[14px]"
                      style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div
                        className="w-6 h-6 border-2 rounded-full animate-spin"
                        style={{ borderColor: "var(--border-default)", borderTopColor: "var(--gs-gold)" }}
                      />
                    </div>
                  ) : isDrank ? (
                    <div
                      className="col-span-2 flex items-center justify-center gap-2 py-3.5 rounded-[14px]"
                      style={{
                        background: "rgba(34,197,94,0.10)",
                        border: "1.5px solid rgba(34,197,94,0.22)",
                        color: "#4ade80",
                      }}
                    >
                      <Check size={18} strokeWidth={2.5} />
                      <span className="font-bold text-sm tracking-wide">İLAÇ ALINDI</span>
                    </div>
                  ) : isMissed ? (
                    <div
                      className="col-span-2 flex items-center justify-center gap-2 py-3.5 rounded-[14px]"
                      style={{
                        background: "rgba(248,113,113,0.09)",
                        border: "1.5px solid rgba(248,113,113,0.18)",
                        color: "#f87171",
                      }}
                    >
                      <X size={18} strokeWidth={2.5} />
                      <span className="font-bold text-sm tracking-wide">İLAÇ ATLANDI</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMarkDrank(medicine.id)}
                        className="flex flex-col items-center justify-center gap-2 py-3.5 rounded-[14px] transition-all active:scale-95"
                        style={{
                          background: "rgba(34,197,94,0.10)",
                          border: "1.5px solid rgba(34,197,94,0.22)",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(34,197,94,0.18)", color: "#4ade80" }}
                        >
                          <Check size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm" style={{ color: "#4ade80" }}>İçtim</span>
                      </button>

                      <button
                        onClick={() => handleMarkMissed(medicine.id)}
                        className="flex flex-col items-center justify-center gap-2 py-3.5 rounded-[14px] transition-all active:scale-95"
                        style={{
                          background: "rgba(248,113,113,0.08)",
                          border: "1.5px solid rgba(248,113,113,0.16)",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(248,113,113,0.16)", color: "#f87171" }}
                        >
                          <X size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm" style={{ color: "#f87171" }}>Atladım</span>
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
        <div className="mt-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 w-full py-3 px-4 rounded-[14px] font-semibold text-sm transition-all"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <Calendar size={14} />
            Geçmiş Kayıtlar
            {showHistory
              ? <ChevronUp size={14} className="ml-auto" />
              : <ChevronDown size={14} className="ml-auto" />
            }
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
                  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    weekday: "short",
                  });

                  return (
                    <div
                      key={date}
                      className="p-3 rounded-[12px] flex items-center gap-3"
                      style={{
                        background: allDrank
                          ? "rgba(34,197,94,0.06)"
                          : anyMissed
                            ? "rgba(248,113,113,0.06)"
                            : "var(--surface-2)",
                        border: `1px solid ${allDrank
                          ? "rgba(34,197,94,0.14)"
                          : anyMissed
                            ? "rgba(248,113,113,0.12)"
                            : "var(--border-subtle)"}`,
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>
                        {allDrank ? "✅" : anyMissed ? "❌" : "⏳"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                          {dateLabel}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                          {dayLogs.map(l => getMedName(l.medicine_id)).join(", ")}
                        </p>
                      </div>
                      <span
                        className="font-bold text-xs"
                        style={{
                          color: allDrank
                            ? "#4ade80"
                            : anyMissed
                              ? "#f87171"
                              : "var(--text-tertiary)",
                        }}
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
