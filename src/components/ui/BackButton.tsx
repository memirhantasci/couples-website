"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center rounded-xl transition-all hover:bg-white/10 shrink-0"
      style={{ 
        width: 48, 
        height: 48, 
        background: "rgba(255,255,255,0.06)", 
        color: "rgba(255,255,255,0.8)" 
      }}
      aria-label="Geri Dön"
    >
      <ArrowLeft size={24} />
    </button>
  );
}
