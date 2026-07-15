"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AddMedicineForm() {
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

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full">
        <Plus size={18} />
        Yeni İlaç Ekle
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-b-none"
              style={{ padding: "24px 20px 32px", borderBottom: "none" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Yeni İlaç Ekle</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>

              <form action={formAction} className="flex flex-col gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    İlaç Adı
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="ör: Vitamin D"
                    required
                    className="input-glass"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      Başlangıç
                    </label>
                    <input
                      name="start_date"
                      type="date"
                      defaultValue={today}
                      required
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      Bitiş
                    </label>
                    <input
                      name="end_date"
                      type="date"
                      required
                      className="input-glass"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Alım Saati
                  </label>
                  <input
                    name="time"
                    type="time"
                    defaultValue="08:00"
                    required
                    className="input-glass"
                  />
                </div>

                <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={16} />
                      Ekle
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
