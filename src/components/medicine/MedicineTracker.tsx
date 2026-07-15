"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateMedicineLogAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Check, X, Clock } from "lucide-react";
import confetti from "canvas-confetti";

interface Medicine {
  id: number;
  name: string;
  time: string;
}

interface MedicineLog {
  medicine_id: number;
  status: "DRANK" | "MISSED" | "PENDING";
}

interface MedicineTrackerProps {
  medicines: Medicine[];
  todayLogs: MedicineLog[];
  userId: number;
}

// Streak milestones that trigger confetti
const STREAK_MILESTONES = [7, 30, 100];

function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#E8002D", "#FFD700", "#ffffff", "#FF4D6D", "#FFE566"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#E8002D", "#FFD700"],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#E8002D", "#FFD700"],
    });
  }, 200);
}

export function MedicineTracker({ medicines, todayLogs, userId }: MedicineTrackerProps) {
  const [logs, setLogs] = useState<Record<number, "DRANK" | "MISSED" | "PENDING">>(
    () => {
      const map: Record<number, "DRANK" | "MISSED" | "PENDING"> = {};
      todayLogs.forEach((log) => {
        map[log.medicine_id] = log.status;
      });
      medicines.forEach((m) => {
        if (!map[m.id]) map[m.id] = "PENDING";
      });
      return map;
    }
  );
  const [loading, setLoading] = useState<number | null>(null);

  async function handleToggle(medicineId: number, currentStatus: string) {
    const newStatus: "DRANK" | "MISSED" =
      currentStatus === "DRANK" ? "MISSED" : "DRANK";

    setLoading(medicineId);
    const prevLogs = { ...logs };
    setLogs((prev) => ({ ...prev, [medicineId]: newStatus }));

    const result = await updateMedicineLogAction(medicineId, newStatus);
    setLoading(null);

    if (result?.error) {
      toast.error(result.error);
      setLogs(prevLogs);
    } else {
      if (newStatus === "DRANK") {
        toast.success("💊 İlaç alındı olarak işaretlendi!");
      } else {
        toast.error("❌ İlaç alınmadı olarak işaretlendi.");
      }
    }
  }

  const drankCount = Object.values(logs).filter((s) => s === "DRANK").length;
  const missedCount = Object.values(logs).filter((s) => s === "MISSED").length;
  const total = medicines.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: "Toplam", value: total, color: "rgba(255,255,255,0.5)" },
            { label: "Alındı", value: drankCount, color: "#4ade80" },
            { label: "Alınmadı", value: missedCount, color: "#f87171" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-bold text-xl" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Medicine cards */}
      {medicines.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 py-12 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <span className="text-4xl">💊</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Aktif ilaç bulunmuyor
          </p>
        </div>
      ) : (
        medicines.map((medicine) => {
          const status = logs[medicine.id] || "PENDING";
          const isDrank = status === "DRANK";
          const isLoading = loading === medicine.id;

          return (
            <motion.div
              key={medicine.id}
              layout
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{
                background: isDrank
                  ? "rgba(34,197,94,0.07)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isDrank ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.3s ease",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: isDrank
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  💊
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{medicine.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                      {medicine.time}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggle(medicine.id, status)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: isDrank
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(255,255,255,0.07)",
                  color: isDrank ? "#4ade80" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${isDrank ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}`,
                  minWidth: 100,
                }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isDrank ? (
                  <>
                    <Check size={14} />
                    Alındı
                  </>
                ) : (
                  <>
                    <X size={14} />
                    Alınmadı
                  </>
                )}
              </button>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
