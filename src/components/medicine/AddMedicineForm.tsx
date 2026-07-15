"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AddMedicineForm({ users }: { users: { id: number; username: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialState: { error?: string; success?: boolean } = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMedicineAction(prev, formData);
      if (result.success) {
        toast.success("İlaç eklendi! 💊");
        setIsOpen(false);
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full shadow-lg">
        <Plus size={18} />
        Yeni İlaç Ekle
      </button>
    );
  }

  return (
    <div className="glass-card p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Plus size={18} style={{ color: "var(--gs-red)" }} />
          Yeni İlaç Ekle
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            Kime Eklenecek?
          </label>
          <select name="user_id" required className="input-glass w-full" defaultValue="">
            <option value="" disabled>Seçiniz...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} style={{ color: "#000" }}>{u.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            İlaç Adı
          </label>
          <input name="name" type="text" placeholder="ör: Vitamin D" required className="input-glass w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Başlangıç
            </label>
            <input name="start_date" type="date" defaultValue={today} required className="input-glass w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Bitiş
            </label>
            <input name="end_date" type="date" required className="input-glass w-full" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            Alım Saati
          </label>
          <input name="time" type="time" defaultValue="08:00" required className="input-glass w-full" />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
          {isPending ? (
            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={16} />
              İlacı Kaydet
            </>
          )}
        </button>
      </form>
    </div>
  );
}
