"use client";

import { useActionState, useRef } from "react";
import { createLetterAction } from "@/actions/letters";
import { toast } from "sonner";
import { Send, LockKeyhole, ChevronDown } from "lucide-react";

interface UserOption {
  id: number;
  username: string;
  display_name?: string;
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
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(245,200,66,0.12)", color: "var(--gs-gold)" }}
        >
          <Send size={15} />
        </div>
        <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
          Geleceğe Mektup Yaz
        </h3>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        {/* Kime */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Kime
          </label>
          <div className="relative">
            <select
              name="receiver_id"
              required
              className="input-glass w-full"
              defaultValue=""
            >
              <option value="" disabled style={{ background: "#1f1f23" }}>Alıcı seç...</option>
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: "#1f1f23", color: "#f4f4f5" }}>
                  {u.display_name || (u.username.charAt(0).toUpperCase() + u.username.slice(1))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Açılış Tarihi */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Açılış Tarihi (Kilit)
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              name="unlock_date"
              type="date"
              min={todayStr}
              required
              className="input-glass w-full pl-11"
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
            Bu tarihe kadar mektup kilitli kalacak ve okunamayacak.
          </p>
        </div>

        {/* Başlık */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Mektup Başlığı
          </label>
          <input
            name="title"
            type="text"
            placeholder="ör: Birinci yılımız için..."
            required
            className="input-glass"
            maxLength={255}
          />
        </div>

        {/* İçerik */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Mektup İçeriği
          </label>
          <textarea
            name="content"
            placeholder="İçinden geçenleri yaz..."
            required
            rows={5}
            className="input-glass resize-none"
            style={{ lineHeight: 1.6 }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-gold w-full mt-1"
          style={{ borderRadius: 14, padding: "14px" }}
        >
          {isPending ? (
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#111" }}
            />
          ) : (
            "💌 Mektubu Mühürle"
          )}
        </button>
      </form>
    </div>
  );
}
