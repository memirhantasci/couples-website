"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateMedicineLogAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

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
  const [logs, setLogs] = useState<Record<string, "DRANK" | "MISSED" | "PENDING">>(
    () => {
      const map: Record<string, "DRANK" | "MISSED" | "PENDING"> = {};
      
      todayLogs.forEach((log) => {
        const timeKey = log.time ? log.time.substring(0, 5) : "";
        if (timeKey) {
          map[`${log.medicine_id}_${timeKey}`] = log.status;
        }
      });

      medicines.forEach((m) => {
        const medTimes = Array.isArray(m.times) && m.times.length > 0
          ? m.times.map((t) => t.substring(0, 5))
          : [m.time ? m.time.substring(0, 5) : "08:00"];

        medTimes.forEach((t) => {
          const key = `${m.id}_${t}`;
          if (!map[key]) {
            const legacyLog = todayLogs.find((l) => l.medicine_id === m.id && (!l.time || l.time === ""));
            map[key] = legacyLog ? legacyLog.status : "PENDING";
          }
        });
      });

      return map;
    }
  );

  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);

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

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentTimeStr = formatter.format(new Date());

  return (
    <div className="flex flex-col gap-0">

      {/* ── CIRCULAR STAT BADGES ──────────────────────── */}
      <div
        className="mx-4 mb-5 py-6 px-4 flex justify-between"
        style={{
          background: "linear-gradient(135deg, #181a20 0%, #151012 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
        }}
      >
        {/* Toplam Doz */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "8px solid #E8002D",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[28px]" style={{ color: "#E8002D", lineHeight: 1.1, marginTop: "4px" }}>
              {totalDoses}
            </span>
            <span className="text-[10px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Toplam Doz
            </span>
          </div>
        </div>

        {/* Alındı */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "8px solid #22C55E",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[28px]" style={{ color: "#22C55E", lineHeight: 1.1, marginTop: "4px" }}>
              {drankCount}
            </span>
            <span className="text-[10px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Alındı
            </span>
          </div>
        </div>

        {/* Bekliyor */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "8px solid #D8A030",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[28px]" style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.1, marginTop: "4px" }}>
              {pendingCount}
            </span>
            <span className="text-[10px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Bekliyor
            </span>
          </div>
        </div>
      </div>

      {/* ── BUGÜNÜN İLAÇLARI HEADER ──────────────────── */}
      <div className="mb-3 px-4">
        <h2 className="font-normal text-[15px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
          <span style={{ fontSize: 16 }}>🏷️</span>
          Bugünün İlaçları
        </h2>
      </div>

      {/* ── MEDICINE CARDS ───────────────────────────── */}
      <div className="flex flex-col gap-4 px-4">
        {medicines.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-16"
            style={{
              background: "#181a20",
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: "16px",
            }}
          >
            <span className="text-4xl">💊</span>
            <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Bugün için aktif ilaç yok
            </p>
          </div>
        ) : (
          medicines.map((medicine) => {
            const medTimes = Array.isArray(medicine.times) && medicine.times.length > 0
              ? medicine.times.map((t) => t.substring(0, 5))
              : [medicine.time ? medicine.time.substring(0, 5) : "08:00"];

            return (
              <motion.div
                key={medicine.id}
                layout
                className="w-full overflow-hidden"
                style={{
                  background: "#181a20",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              >
                <div className="flex flex-col p-5 gap-4">
                  {/* Header */}
                  <div>
                    <p className="font-bold text-[26px] tracking-tight leading-none" style={{ color: "#ffffff" }}>
                      {medicine.name}
                    </p>
                    <p className="text-[13px] mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Günde {medTimes.length} kez ({medTimes.join(", ")})
                    </p>
                  </div>

                  {/* Dose Slots */}
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
                          className="flex items-center justify-between w-full gap-3"
                        >
                          {/* Check icon circle */}
                          <div
                            className="flex items-center justify-center shrink-0"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              border: isDrank
                                ? "2px solid #22C55E"
                                : isMissed
                                  ? "2px solid #D84257"
                                  : "2px solid rgba(255,255,255,0.15)",
                              background: isDrank
                                ? "rgba(34, 197, 94, 0.1)"
                                : isMissed
                                  ? "rgba(216, 66, 87, 0.1)"
                                  : "rgba(255,255,255,0.03)",
                            }}
                          >
                            {isDrank ? (
                              <Check size={22} color="#22C55E" strokeWidth={3} />
                            ) : isMissed ? (
                              <X size={22} color="#D84257" strokeWidth={3} />
                            ) : (
                              <Check size={22} color="rgba(255,255,255,0.2)" strokeWidth={2} />
                            )}
                          </div>

                          {/* Action button / Status */}
                          <div className="flex-1">
                            {isLoading ? (
                              <div className="py-3 px-4 flex items-center justify-center rounded-xl bg-white/5">
                                <div
                                  className="w-5 h-5 border-2 rounded-full animate-spin"
                                  style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }}
                                />
                              </div>
                            ) : isDrank ? (
                              <div
                                className="flex items-center justify-center py-3 px-4 rounded-xl"
                                style={{ background: "#22C55E", color: "#ffffff" }}
                              >
                                <span className="font-bold text-[14px]">✓ DOZ ALINDI 🔒</span>
                              </div>
                            ) : isMissed ? (
                              <div
                                className="flex items-center justify-center py-3 px-4 rounded-xl"
                                style={{ background: "#D84257", color: "#ffffff" }}
                              >
                                <span className="font-bold text-[14px]">DOZ ATLANDI</span>
                              </div>
                            ) : !isTimePassed ? (
                              <p
                                className="text-[13px] font-medium py-3 px-4 rounded-xl bg-white/5 inline-block"
                                style={{ color: "rgba(255,255,255,0.5)" }}
                              >
                                {slotTime} 🔒
                              </p>
                            ) : (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleMarkDrank(medicine.id, slotTime)}
                                  className="flex items-center justify-center py-3 px-5 rounded-xl font-bold text-[14px] transition-all active:scale-95"
                                  style={{ background: "#22C55E", color: "#ffffff" }}
                                >
                                  İçtim
                                </button>
                                <button
                                  onClick={() => handleMarkMissed(medicine.id, slotTime)}
                                  className="flex items-center justify-center py-3 px-5 rounded-xl font-bold text-[14px] transition-all active:scale-95"
                                  style={{ background: "#D84257", color: "#ffffff" }}
                                >
                                  Atla
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Sağdaki status text */}
                          {isDrank && (
                            <span className="text-[12px] font-medium shrink-0" style={{ color: "#22C55E" }}>
                              ✓Alındı
                            </span>
                          )}
                          {isMissed && (
                            <span className="text-[12px] font-medium shrink-0" style={{ color: "#D84257" }}>
                              ✗Atlandı
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── GEÇMIŞ KAYITLAR ──────────────────────────── */}
      {(() => {
        const historyByDate: Record<string, MedicineLog[]> = {};
        historicalLogs.forEach((log) => {
          if (!historyByDate[log.date]) historyByDate[log.date] = [];
          historyByDate[log.date].push(log);
        });
        const historyDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a)).slice(0, 9);
        const getMedName = (id: number) => medicines.find((m) => m.id === id)?.name ?? "İlaç";

        if (historyDates.length === 0) return null;

        return (
          <div className="mt-6 px-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span style={{ fontSize: 16 }}>🕒</span>
              <h2 className="font-normal text-[15px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                Geçmiş Kayıtlar
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2.5 overflow-y-auto max-h-[260px]" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {historyDates.map((date) => {
                const dayLogs = historyByDate[date];
                const drankLogsCount = dayLogs.filter((l) => l.status === "DRANK").length;
                const dateObj = new Date(date + "T00:00:00");
                const dayName = dateObj.toLocaleDateString("tr-TR", { weekday: "short" });
                const dayNum = dateObj.getDate();
                const monthName = dateObj.toLocaleDateString("tr-TR", { month: "long" });
                const dateLabel = `${dayNum} ${monthName} ${dayName}`;

                return (
                  <div
                    key={date}
                    className="p-2.5 rounded-[12px] flex flex-col gap-2 items-center text-center justify-between"
                    style={{
                      background: "#181a20",
                      border: "1px solid rgba(232, 0, 45, 0.6)",
                      minHeight: 100,
                    }}
                  >
                    <p className="font-normal text-[11px]" style={{ color: "#ffffff" }}>
                      {dateLabel}
                    </p>
                    <p className="text-[12px] font-normal" style={{ color: "#E8002D", lineHeight: 1.2 }}>
                      {Array.from(new Set(dayLogs.map((l) => getMedName(l.medicine_id)))).join(", ")}
                    </p>
                    <div
                      className="px-2.5 py-0.5 mt-auto rounded-full text-[10px] font-medium"
                      style={{
                        background: drankLogsCount === dayLogs.length ? "#22C55E" : "#E8002D",
                        color: "#ffffff",
                      }}
                    >
                      {drankLogsCount}/{dayLogs.length} Doz
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
