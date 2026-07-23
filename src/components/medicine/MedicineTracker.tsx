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
  times?: string[];
}

interface MedicineLog {
  medicine_id: number;
  status: "DRANK" | "MISSED" | "PENDING";
  date: string;
  time?: string;
}

interface MedicineTrackerProps {
  medicines: Medicine[];
  todayLogs: MedicineLog[];
  historicalLogs: MedicineLog[];
  userId: number;
}

export function MedicineTracker({ medicines, todayLogs, historicalLogs, userId }: MedicineTrackerProps) {
  // Key format: `${medicine_id}_${time}`
  const [logs, setLogs] = useState<Record<string, "DRANK" | "MISSED" | "PENDING">>(
    () => {
      const map: Record<string, "DRANK" | "MISSED" | "PENDING"> = {};
      
      // Populate from server logs
      todayLogs.forEach((log) => {
        const timeKey = log.time ? log.time.substring(0, 5) : "";
        if (timeKey) {
          map[`${log.medicine_id}_${timeKey}`] = log.status;
        }
      });

      // Default pending for all scheduled dose slots
      medicines.forEach((m) => {
        const medTimes = Array.isArray(m.times) && m.times.length > 0
          ? m.times.map((t) => t.substring(0, 5))
          : [m.time ? m.time.substring(0, 5) : "08:00"];

        medTimes.forEach((t) => {
          const key = `${m.id}_${t}`;
          if (!map[key]) {
            // Check if legacy log without time exists
            const legacyLog = todayLogs.find((l) => l.medicine_id === m.id && (!l.time || l.time === ""));
            map[key] = legacyLog ? legacyLog.status : "PENDING";
          }
        });
      });

      return map;
    }
  );

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  async function handleMarkDrank(medicineId: number, slotTime: string) {
    const key = `${medicineId}_${slotTime}`;
    const current = logs[key] || "PENDING";
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoadingSlot(key);
    setLogs((prev) => ({ ...prev, [key]: "DRANK" }));
    const result = await updateMedicineLogAction(medicineId, "DRANK", slotTime);
    setLoadingSlot(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [key]: current }));
    } else {
      toast.success(`💊 Saat ${slotTime} dozu alındı olarak işaretlendi!`);
    }
  }

  async function handleMarkMissed(medicineId: number, slotTime: string) {
    const key = `${medicineId}_${slotTime}`;
    const current = logs[key] || "PENDING";
    if (current === "DRANK") {
      toast.info("Alındı olarak işaretlendi, değiştirilemez 🔒");
      return;
    }
    setLoadingSlot(key);
    setLogs((prev) => ({ ...prev, [key]: "MISSED" }));
    const result = await updateMedicineLogAction(medicineId, "MISSED", slotTime);
    setLoadingSlot(null);
    if (result?.error) {
      toast.error(result.error);
      setLogs((prev) => ({ ...prev, [key]: current }));
    } else {
      toast.error(`❌ Saat ${slotTime} dozu atlandı olarak işaretlendi.`);
    }
  }

  // Calculate summary counts across all active scheduled dose slots
  const scheduledSlots: { medId: number; time: string }[] = [];
  medicines.forEach((m) => {
    const medTimes = Array.isArray(m.times) && m.times.length > 0
      ? m.times.map((t) => t.substring(0, 5))
      : [m.time ? m.time.substring(0, 5) : "08:00"];
    medTimes.forEach((t) => {
      scheduledSlots.push({ medId: m.id, time: t });
    });
  });

  const totalDoses = scheduledSlots.length;
  const drankCount = scheduledSlots.filter((s) => logs[`${s.medId}_${s.time}`] === "DRANK").length;
  const missedCount = scheduledSlots.filter((s) => logs[`${s.medId}_${s.time}`] === "MISSED").length;
  const pendingCount = scheduledSlots.filter((s) => (logs[`${s.medId}_${s.time}`] || "PENDING") === "PENDING").length;

  // Group historical logs by date
  const historyByDate: Record<string, MedicineLog[]> = {};
  historicalLogs.forEach((log) => {
    if (!historyByDate[log.date]) historyByDate[log.date] = [];
    historyByDate[log.date].push(log);
  });
  const historyDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  const getMedName = (id: number) => medicines.find((m) => m.id === id)?.name ?? "İlaç";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentTimeStr = formatter.format(new Date());

  return (
    <div className="flex flex-col gap-3">
      {/* Summary Bar */}
      {totalDoses > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Toplam Doz", value: totalDoses, color: "var(--text-secondary)", bg: "var(--surface-3)" },
            { label: "Alındı", value: drankCount, color: "#4ade80", bg: "rgba(34,197,94,0.09)" },
            { label: "Bekliyor", value: pendingCount, color: "var(--gs-gold)", bg: "rgba(245,200,66,0.08)" },
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
          const medTimes = Array.isArray(medicine.times) && medicine.times.length > 0
            ? medicine.times.map((t) => t.substring(0, 5))
            : [medicine.time ? medicine.time.substring(0, 5) : "08:00"];

          const allDosesDrank = medTimes.every((t) => logs[`${medicine.id}_${t}`] === "DRANK");
          const anyDoseMissed = medTimes.some((t) => logs[`${medicine.id}_${t}`] === "MISSED");

          return (
            <motion.div
              key={medicine.id}
              layout
              className="rounded-[18px] overflow-hidden"
              style={{
                background: allDosesDrank
                  ? "rgba(34,197,94,0.07)"
                  : anyDoseMissed
                    ? "rgba(248,113,113,0.06)"
                    : "var(--surface-2)",
                border: `1.5px solid ${
                  allDosesDrank
                    ? "rgba(34,197,94,0.20)"
                    : anyDoseMissed
                      ? "rgba(248,113,113,0.16)"
                      : "var(--border-default)"
                }`,
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div className="flex flex-col p-4 gap-4">
                {/* Header: Icon & Name */}
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: allDosesDrank
                        ? "rgba(34,197,94,0.14)"
                        : anyDoseMissed
                          ? "rgba(248,113,113,0.10)"
                          : "var(--surface-3)",
                    }}
                  >
                    {allDosesDrank ? "✅" : anyDoseMissed ? "❌" : "💊"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                      {medicine.name}
                    </p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Günde {medTimes.length} kez ({medTimes.join(", ")})
                    </p>
                  </div>
                </div>

                {/* Dose Slots List */}
                <div className="flex flex-col gap-3">
                  {medTimes.map((slotTime, idx) => {
                    const key = `${medicine.id}_${slotTime}`;
                    const status = logs[key] || "PENDING";
                    const isDrank = status === "DRANK";
                    const isMissed = status === "MISSED";
                    const isLoading = loadingSlot === key;
                    const isTimePassed = currentTimeStr >= slotTime;

                    return (
                      <div
                        key={slotTime}
                        className="flex flex-col gap-2 p-3 rounded-[14px]"
                        style={{
                          background: isDrank
                            ? "rgba(34,197,94,0.08)"
                            : isMissed
                              ? "rgba(248,113,113,0.07)"
                              : "var(--surface-3)",
                          border: `1px solid ${
                            isDrank
                              ? "rgba(34,197,94,0.2)"
                              : isMissed
                                ? "rgba(248,113,113,0.18)"
                                : "var(--border-subtle)"
                          }`,
                        }}
                      >
                        {/* Slot info header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock size={13} style={{ color: "var(--gs-gold)" }} />
                            <span className="text-xs font-bold text-white">
                              {medTimes.length > 1 ? `${idx + 1}. Doz (${slotTime})` : `Saat ${slotTime}`}
                            </span>
                          </div>

                          {isDrank ? (
                            <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                              <Check size={12} /> Alındı
                            </span>
                          ) : isMissed ? (
                            <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                              <X size={12} /> Atlandı
                            </span>
                          ) : !isTimePassed ? (
                            <span className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1">
                              <Lock size={11} /> Bekliyor
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-white/60">
                              Vakti Geldi
                            </span>
                          )}
                        </div>

                        {/* Action controls */}
                        <div className="w-full mt-1">
                          {isLoading ? (
                            <div className="py-2 flex items-center justify-center rounded-[10px] bg-white/5">
                              <div
                                className="w-4 h-4 border-2 rounded-full animate-spin"
                                style={{ borderColor: "var(--border-default)", borderTopColor: "var(--gs-gold)" }}
                              />
                            </div>
                          ) : isDrank ? (
                            <div
                              className="flex items-center justify-center gap-2 py-2 rounded-[10px]"
                              style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}
                            >
                              <Check size={15} strokeWidth={2.5} />
                              <span className="font-bold text-xs">DOZ ALINDI 🔒</span>
                            </div>
                          ) : isMissed ? (
                            <div
                              className="flex items-center justify-center gap-2 py-2 rounded-[10px]"
                              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
                            >
                              <X size={15} strokeWidth={2.5} />
                              <span className="font-bold text-xs">DOZ ATLANDI</span>
                            </div>
                          ) : !isTimePassed ? (
                            <p className="text-[11px] text-center font-semibold py-1.5 rounded-[10px] bg-white/5" style={{ color: "var(--gs-gold)" }}>
                              Saat {slotTime}'dan sonra açılacak 🔒
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleMarkDrank(medicine.id, slotTime)}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] font-bold text-xs transition-all active:scale-95"
                                style={{
                                  background: "rgba(34,197,94,0.15)",
                                  border: "1px solid rgba(34,197,94,0.3)",
                                  color: "#4ade80",
                                }}
                              >
                                <Check size={16} strokeWidth={2.5} />
                                İçtim
                              </button>

                              <button
                                onClick={() => handleMarkMissed(medicine.id, slotTime)}
                                className="flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] font-bold text-xs transition-all active:scale-95"
                                style={{
                                  background: "rgba(248,113,113,0.12)",
                                  border: "1px solid rgba(248,113,113,0.25)",
                                  color: "#f87171",
                                }}
                              >
                                <X size={16} strokeWidth={2.5} />
                                Atladım
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
            {showHistory ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 flex flex-col gap-2"
              >
                {historyDates.map((date) => {
                  const dayLogs = historyByDate[date];
                  const drankLogsCount = dayLogs.filter((l) => l.status === "DRANK").length;
                  const allDrank = dayLogs.every((l) => l.status === "DRANK");
                  const anyMissed = dayLogs.some((l) => l.status === "MISSED");
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
                        border: `1px solid ${
                          allDrank
                            ? "rgba(34,197,94,0.14)"
                            : anyMissed
                              ? "rgba(248,113,113,0.12)"
                              : "var(--border-subtle)"
                        }`,
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
                          {Array.from(new Set(dayLogs.map((l) => getMedName(l.medicine_id)))).join(", ")}
                        </p>
                      </div>
                      <span
                        className="font-bold text-xs"
                        style={{
                          color: allDrank ? "#4ade80" : anyMissed ? "#f87171" : "var(--text-tertiary)",
                        }}
                      >
                        {drankLogsCount}/{dayLogs.length} Doz
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
