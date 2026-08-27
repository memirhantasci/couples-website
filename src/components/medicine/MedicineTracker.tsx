"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateMedicineLogAction } from "@/actions/medicine";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Check, X, Trophy, Lock, Sparkles, Award } from "lucide-react";

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
  currentStreak?: number;
  userName?: string;
}

export function MedicineTracker({ medicines, todayLogs, historicalLogs, userId, currentStreak = 0, userName = "" }: MedicineTrackerProps) {
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
  const [milestoneCelebration, setMilestoneCelebration] = useState<{ milestone: number; streak: number } | null>(null);
  const [streak, setStreak] = useState(currentStreak);

  function triggerCelebrationConfetti() {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    // Continuous side cannons
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 45 * (timeLeft / duration);
      confetti({
        particleCount,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        zIndex: 9999999,
        colors: ["#FFD700", "#E8002D", "#22C55E", "#60A5FA", "#EC4899", "#A855F7"]
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        zIndex: 9999999,
        colors: ["#FFD700", "#E8002D", "#22C55E", "#60A5FA", "#EC4899", "#A855F7"]
      });
    }, 250);

    // Initial big central bursts
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.45 },
      zIndex: 9999999,
      colors: ["#FFD700", "#E8002D", "#FFFFFF", "#F59E0B"]
    });
  }

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
      
      // Calculate total doses vs drank doses to see if day completed
      const scheduledSlots: { medId: number; time: string }[] = [];
      medicines.forEach((m) => {
        const medTimes = Array.isArray(m.times) && m.times.length > 0
          ? m.times.map((t) => t.substring(0, 5))
          : [m.time ? m.time.substring(0, 5) : "08:00"];
        medTimes.forEach((t) => scheduledSlots.push({ medId: m.id, time: t }));
      });
      const totalDoses = scheduledSlots.length;
      // Re-calculate drankCount with the newly clicked dose
      let tempDrankCount = 1; // including this one
      scheduledSlots.forEach((s) => {
        const k = `${s.medId}_${s.time}`;
        if (k !== key && logs[k] === "DRANK") tempDrankCount++;
      });
      
      if (tempDrankCount === totalDoses) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        
        let earnedMilestone = 0;
        if (newStreak === 7) earnedMilestone = 7;
        else if (newStreak >= 30 && newStreak % 30 === 0) earnedMilestone = newStreak;
        
        if (earnedMilestone > 0) {
          triggerCelebrationConfetti();
          setMilestoneCelebration({ milestone: earnedMilestone, streak: newStreak });
          // Auto close after celebration animation completes
          setTimeout(() => {
            setMilestoneCelebration(null);
          }, 6500);
        }
      }
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

  const trophyMilestones = [
    { target: 7, title: "1. Hafta", label: "7 Günlük Seri", icon: "🥉", color: "#CD7F32", bgGlow: "rgba(205, 127, 50, 0.22)", border: "rgba(205, 127, 50, 0.6)" },
    { target: 30, title: "1. Ay", label: "30 Günlük Seri", icon: "🥈", color: "#E0E0E0", bgGlow: "rgba(224, 224, 224, 0.22)", border: "rgba(224, 224, 224, 0.6)" },
    { target: 60, title: "2. Ay", label: "60 Günlük Seri", icon: "🥇", color: "#FFD700", bgGlow: "rgba(255, 215, 0, 0.22)", border: "rgba(255, 215, 0, 0.6)" },
    { target: 90, title: "3. Ay", label: "90 Günlük Seri", icon: "💎", color: "#60A5FA", bgGlow: "rgba(96, 165, 250, 0.22)", border: "rgba(96, 165, 250, 0.6)" },
    { target: 180, title: "6. Ay", label: "180 Günlük Seri", icon: "👑", color: "#C084FC", bgGlow: "rgba(192, 132, 252, 0.22)", border: "rgba(192, 132, 252, 0.6)" },
    { target: 365, title: "1. Yıl", label: "365 Günlük Seri", icon: "🌟", color: "#F59E0B", bgGlow: "rgba(245, 158, 11, 0.22)", border: "rgba(245, 158, 11, 0.6)" },
  ];

  const unlockedCount = trophyMilestones.filter((t) => streak >= t.target).length;

  return (
    <div className="flex flex-col gap-0">
      
      {/* ── FULLSCREEN CELEBRATION MODAL ──────────────────────── */}
      <AnimatePresence>
        {milestoneCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMilestoneCelebration(null)}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
            style={{
              background: "radial-gradient(circle at center, rgba(30, 15, 20, 0.96) 0%, rgba(0, 0, 0, 0.98) 100%)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Background Animated Rays / Glow */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 animate-pulse"
              style={{
                background: "radial-gradient(circle at 50% 40%, rgba(255, 215, 0, 0.35) 0%, rgba(232, 0, 45, 0.25) 40%, transparent 70%)"
              }}
            />

            <motion.div
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-[32px] p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden shadow-[0_0_80px_rgba(255,215,0,0.4)]"
              style={{
                background: "linear-gradient(180deg, #241b1d 0%, #161314 50%, #0d0c0d 100%)",
                border: "2px solid rgba(255, 215, 0, 0.65)",
              }}
            >
              {/* Close Icon */}
              <button
                type="button"
                onClick={() => setMilestoneCelebration(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              {/* Shiny Top Ribbon */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                style={{
                  background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)",
                  color: "#18181b",
                }}
              >
                <Sparkles size={14} className="animate-spin" />
                YENİ BAŞARI KUPASI KAZANILDI!
              </motion.div>

              {/* Large Animated Trophy */}
              <div className="relative my-3 flex items-center justify-center">
                <div 
                  className="absolute w-32 h-32 rounded-full animate-ping opacity-25"
                  style={{ background: "radial-gradient(circle, #FFD700 0%, transparent 70%)" }}
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, -6, 6, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.8,
                    ease: "easeInOut" 
                  }}
                  className="text-7xl filter drop-shadow-[0_10px_25px_rgba(255,215,0,0.7)]"
                >
                  🏆
                </motion.div>
              </div>

              {/* Milestone Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1"
                style={{
                  textShadow: "0 2px 20px rgba(255,215,0,0.6)"
                }}
              >
                {milestoneCelebration.milestone}. Gün Kupası!
              </motion.h2>

              <p className="text-xs text-amber-300/90 font-bold uppercase tracking-wider mt-1 flex items-center gap-1 justify-center">
                🔥 {milestoneCelebration.streak} Günlük Muhteşem Seri
              </p>

              {/* Heartfelt Special Message Card */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full mt-5 p-4 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 0, 45, 0.3) 0%, rgba(20, 10, 15, 0.85) 100%)",
                  border: "1.5px solid rgba(232, 0, 45, 0.55)",
                  boxShadow: "0 0 35px rgba(232, 0, 45, 0.4)",
                }}
              >
                <span className="text-2xl block mb-1 animate-bounce">❤️</span>
                <p className="text-white text-lg font-black tracking-wide leading-snug" style={{ textShadow: "0 2px 12px rgba(232,0,45,0.8)" }}>
                  öykü seni çok seviyorum
                </p>
                <p className="text-red-200/90 text-xs font-medium mt-1">
                  bunu ne zaman okursan oku ✨
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CIRCULAR STAT BADGES ──────────────────────── */}
      <div
        className="mx-4 mb-6 py-8 px-5 flex justify-between"
        style={{
          background: "linear-gradient(135deg, #181a20 0%, #151012 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "24px",
        }}
      >
        {/* Toplam Doz */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 116,
              height: 116,
              borderRadius: "50%",
              border: "3px solid #E8002D",
              boxShadow: "0 0 20px rgba(232, 0, 45, 0.6), inset 0 0 12px rgba(232, 0, 45, 0.4)",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[34px]" style={{ color: "#E8002D", lineHeight: 1.1, marginTop: "4px" }}>
              {totalDoses}
            </span>
            <span className="text-[12px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Toplam Doz
            </span>
          </div>
        </div>

        {/* Alındı */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 116,
              height: 116,
              borderRadius: "50%",
              border: "3px solid #22C55E",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.6), inset 0 0 12px rgba(34, 197, 94, 0.4)",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[34px]" style={{ color: "#22C55E", lineHeight: 1.1, marginTop: "4px" }}>
              {drankCount}
            </span>
            <span className="text-[12px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Alındı
            </span>
          </div>
        </div>

        {/* Bekliyor */}
        <div className="flex justify-center flex-1">
          <div
            className="flex flex-col items-center justify-center relative"
            style={{
              width: 116,
              height: 116,
              borderRadius: "50%",
              border: "3px solid #D8A030",
              boxShadow: "0 0 20px rgba(216, 160, 48, 0.6), inset 0 0 12px rgba(216, 160, 48, 0.4)",
              background: "transparent",
            }}
          >
            <span className="font-medium text-[34px]" style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.1, marginTop: "4px" }}>
              {pendingCount}
            </span>
            <span className="text-[12px] font-normal mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
              Bekliyor
            </span>
          </div>
        </div>
      </div>

      {/* ── KAZANILAN & HEDEF KUPALAR VITRINI ──────────────────────────── */}
      <div className="mb-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-normal text-[15px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            Başarı Kupaları
          </h2>
          <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)" }}>
            {unlockedCount} / {trophyMilestones.length} Kazanıldı
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 -mx-4 px-4 scrollbar-none snap-x" style={{ scrollbarWidth: "none" }}>
          {trophyMilestones.map((trophy) => {
            const isUnlocked = streak >= trophy.target;
            const progress = Math.min(100, Math.round((streak / trophy.target) * 100));

            // Kazanıldıysa altın rengi parlasın, kazanılmadıysa kendi orijinal pasif renginde kalsın
            const displayColor = isUnlocked ? "#FFD700" : trophy.color;
            const displayBgGlow = isUnlocked ? "rgba(255, 215, 0, 0.22)" : trophy.bgGlow;
            const displayBorder = isUnlocked ? "rgba(255, 215, 0, 0.6)" : trophy.border;

            return (
              <div
                key={trophy.target}
                className="flex flex-col items-center justify-between p-3.5 rounded-2xl min-w-[130px] max-w-[130px] shrink-0 snap-start transition-all relative overflow-hidden"
                style={{
                  background: isUnlocked
                    ? `linear-gradient(135deg, ${displayBgGlow} 0%, #181a20 100%)`
                    : "#14161a",
                  border: isUnlocked
                    ? `1.5px solid ${displayBorder}`
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isUnlocked
                    ? `0 0 16px ${displayBgGlow}`
                    : "none",
                  opacity: isUnlocked ? 1 : 0.75,
                }}
              >
                {/* Status Badge */}
                <div className="w-full flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    {trophy.title}
                  </span>
                  {isUnlocked ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                      ✓ AÇIK
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/40">
                      <Lock size={11} />
                    </span>
                  )}
                </div>

                {/* Trophy Icon */}
                <div className="my-1 relative flex items-center justify-center">
                  <span
                    className={`text-3xl transition-transform ${isUnlocked ? "scale-110" : "grayscale opacity-50"}`}
                    style={{
                      textShadow: isUnlocked ? `0 0 15px ${displayColor}` : "none",
                    }}
                  >
                    {trophy.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  className="text-[12px] font-bold text-center mt-1 leading-tight"
                  style={{ color: isUnlocked ? displayColor : "rgba(255,255,255,0.6)" }}
                >
                  {trophy.label}
                </span>

                {/* Progress bar / footer */}
                <div className="w-full mt-2">
                  {isUnlocked ? (
                    <div className="w-full text-center py-0.5 rounded bg-white/5 text-[10px] font-semibold text-white/80">
                      Kazanıldı ✨
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between text-[9px] font-medium text-white/40">
                        <span>{streak}g</span>
                        <span>{trophy.target}g</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background: trophy.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
                <div className="flex flex-col items-center justify-evenly py-3.5 px-4 min-h-[130px] text-center w-full gap-2.5">
                  {/* Title */}
                  <p className="font-bold text-[17px] tracking-tight leading-tight text-white text-center">
                    {medicine.name}
                  </p>

                  {/* Subtitle */}
                  <p className="text-[11px] text-center text-neutral-400">
                    Günde {medTimes.length} kez ({medTimes.join(", ")})
                  </p>

                  {/* Dose Slots / Button */}
                  <div className="flex flex-col gap-2 w-full items-center justify-center">
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
                          className="flex items-center justify-center w-full"
                        >
                          {isLoading ? (
                            <div className="py-2 px-3.5 flex items-center justify-center rounded-lg bg-white/5">
                              <div
                                className="w-4 h-4 border-2 rounded-full animate-spin"
                                style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }}
                              />
                            </div>
                          ) : isDrank ? (
                            <div className="flex items-center justify-center w-full">
                              {/* Solid green DOZ ALINDI button */}
                              <div
                                className="py-2.5 px-5 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                                style={{ background: "#22C55E", color: "#ffffff" }}
                              >
                                <span className="font-bold text-[15px] tracking-wide flex items-center gap-1.5 justify-center text-center">
                                  ✓ DOZ ALINDI 🔒
                                </span>
                              </div>
                            </div>
                          ) : isMissed ? (
                            <div className="flex items-center justify-center w-full">
                              <div
                                className="py-2.5 px-5 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(216,66,87,0.35)]"
                                style={{ background: "#D84257", color: "#ffffff" }}
                              >
                                <span className="font-bold text-[15px] tracking-wide justify-center text-center">
                                  DOZ ATLANDI
                                </span>
                              </div>
                            </div>
                          ) : !isTimePassed ? (
                            <div className="flex items-center justify-center w-full">
                              <div className="py-2.5 px-5 rounded-xl flex items-center justify-center bg-white/5 text-white/50 text-[12px] font-medium text-center">
                                {slotTime} 🔒
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2.5 w-full">
                              <button
                                onClick={() => handleMarkDrank(medicine.id, slotTime)}
                                className="flex-1 max-w-[110px] py-2.5 px-4 rounded-xl font-bold text-[13px] transition-all active:scale-95 flex items-center justify-center text-center"
                                style={{ background: "#22C55E", color: "#ffffff" }}
                              >
                                İçtim
                              </button>
                              <button
                                onClick={() => handleMarkMissed(medicine.id, slotTime)}
                                className="flex-1 max-w-[110px] py-2.5 px-4 rounded-xl font-bold text-[13px] transition-all active:scale-95 flex items-center justify-center text-center"
                                style={{ background: "#D84257", color: "#ffffff" }}
                              >
                                Atla
                              </button>
                            </div>
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

            <div className="grid grid-cols-3 gap-[10px] p-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
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
