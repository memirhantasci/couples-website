"use client";

import { motion } from "framer-motion";

interface LoveMeterProps {
  value: number; // 80-100
}

export function LoveMeter({ value }: LoveMeterProps) {
  return (
    <div
      style={{
        background: "#181a20",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h2 className="text-xl font-bold mb-4" style={{ color: "#ffffff" }}>
        Aşk Ölçer
      </h2>

      {/* Progress bar — kalın, red to gold */}
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{
          height: 36,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-[24px] flex items-center justify-end pr-4"
          style={{
            background: "linear-gradient(90deg, #E8002D 0%, #D8A030 100%)",
          }}
        >
          {/* Percentage label inside bar */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[14px] font-medium"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {value}%
          </motion.span>
        </motion.div>
      </div>

      <p
        className="text-[13px] mt-4"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        Bugün için ölçüldü 🤝
      </p>
    </div>
  );
}
