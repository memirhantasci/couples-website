"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface LoveMeterProps {
  value: number; // 80-100
}

export function LoveMeter({ value }: LoveMeterProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={18} fill="#E8002D" color="#E8002D" />
          <span className="font-semibold text-sm text-white">Aşk Ölçer</span>
        </div>
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-gradient font-bold text-2xl"
        >
          {value}%
        </motion.span>
      </div>

      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      <p
        className="text-xs mt-2 text-right"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        Bugün için ölçüldü 💫
      </p>
    </div>
  );
}
