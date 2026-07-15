"use client";

import { useActionState, useRef } from "react";
import { createLetterAction } from "@/actions/letters";
import { toast } from "sonner";
import { Send, LockKeyhole } from "lucide-react";

interface UserOption {
  id: number;
  username: string;
}

export function WriteLetterForm({ users }: { users: UserOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: { error?: string; success?: boolean } = {};
  
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createLetterAction(prev, formData);
      if (result.success) {
        toast.success("Mektup başarıyla mühürlendi! 💌");
        formRef.current?.reset();
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Send size={20} style={{ color: "var(--gs-gold)" }} />
        <h3 className="font-bold text-white text-base">Geleceğe Mektup Yaz</h3>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            Kime
          </label>
          <select 
            name="receiver_id" 
            required 
            className="input-glass w-full text-base py-3 appearance-none"
            defaultValue=""
          >
            <option value="" disabled>Alıcı seç...</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="text-black">
                {u.username === "emirhan" ? "Emirhan" : u.username === "oyku" ? "Öykü" : u.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            Açılış Tarihi (Kilit)
          </label>
          <div className="relative">
            <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input 
              name="unlock_date" 
              type="date" 
              min={todayStr}
              required 
              className="input-glass w-full text-base py-3 pl-11" 
              style={{ colorScheme: "dark" }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Bu tarihe kadar mektup kilitli kalacak ve okunamayacak.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            Mektup Başlığı
          </label>
          <input 
            name="title" 
            type="text" 
            placeholder="ör: Birinci yılımız için..." 
            required 
            className="input-glass text-base py-3" 
            maxLength={255}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            Mektup İçeriği
          </label>
          <textarea 
            name="content" 
            placeholder="İçinden geçenleri yaz..." 
            required 
            rows={5}
            className="input-glass resize-none text-base py-3" 
          />
        </div>

        <button type="submit" disabled={isPending} className="btn-gold w-full py-3.5 mt-2 text-base">
          {isPending ? (
            <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin mx-auto" />
          ) : (
            "Mektubu Mühürle"
          )}
        </button>
      </form>
    </div>
  );
}
