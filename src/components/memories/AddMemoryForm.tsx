"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createMemoryAction } from "@/actions/memories";
import { toast } from "sonner";
import { Plus, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AddMemoryForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const initialState: { error?: string; success?: boolean } = {};
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMemoryAction(prev, formData);
      if (result.success) {
        toast.success("Anı eklendi! 📸");
        setIsOpen(false);
        setImageUrl("");
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
      <button onClick={() => setIsOpen(true)} className="btn-gold w-full">
        <Plus size={18} />
        Yeni Anı Ekle
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-b-none overflow-y-auto"
              style={{ padding: "24px 20px 40px", maxHeight: "85dvh" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Yeni Anı</h3>
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
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Tarih
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={today}
                    required
                    className="input-glass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Başlık
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="ör: İlk kahvemiz ☕"
                    required
                    className="input-glass"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Açıklama (isteğe bağlı)
                  </label>
                  <textarea
                    name="description"
                    placeholder="Bu anı hakkında bir şeyler yaz..."
                    rows={3}
                    className="input-glass resize-none"
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Fotoğraf URL (isteğe bağlı)
                  </label>
                  <div className="relative">
                    <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input
                      name="image_url"
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="input-glass"
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isPending} className="btn-gold w-full mt-2">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
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
