"use client";

import { useActionState, useRef, useState } from "react";
import { createMeetingAction, deactivateMeetingAction, updateMeetingAction } from "@/actions/meetings";
import { toast } from "sonner";
import { Plus, CalendarClock, Trash2, Edit2, Save, X } from "lucide-react";

interface Meeting {
  id: number;
  meeting_datetime: string;
  title: string | null;
  is_active: boolean;
}

interface MeetingManagerProps {
  activeMeetings: Meeting[];
}

export function MeetingManager({ activeMeetings }: MeetingManagerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: { error?: string; success?: boolean } = {};
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDatetime, setEditDatetime] = useState<string>("");

  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMeetingAction(prev, formData);
      if (result.success) {
        toast.success("Buluşma başarıyla planlandı! 📍");
        formRef.current?.reset();
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  async function handleDeactivate(id: number) {
    if (!confirm("Buluşmayı iptal etmek istediğine emin misin?")) return;
    
    const result = await deactivateMeetingAction(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Buluşma iptal edildi.");
  }

  async function handleUpdate(id: number) {
    if (!editDatetime) return;
    const result = await updateMeetingAction(id, editDatetime);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Buluşma tarihi güncellendi.");
      setEditingId(null);
    }
  }

  // Min datetime: now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock size={20} style={{ color: "var(--gs-gold)" }} />
          <h3 className="font-bold text-white text-base">Aktif Buluşmalar</h3>
        </div>

        {activeMeetings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.15)",
                }}
              >
                <div>
                  <p className="font-bold text-white text-lg">
                    {meeting.title || "Buluşma"}
                  </p>
                  {editingId === meeting.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="datetime-local" 
                        value={editDatetime}
                        onChange={(e) => setEditDatetime(e.target.value)}
                        className="input-glass text-sm py-1.5 px-2"
                      />
                    </div>
                  ) : (
                    <p style={{ color: "rgba(255,215,0,0.9)", fontSize: 14, marginTop: 4 }}>
                      {new Date(meeting.meeting_datetime).toLocaleString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === meeting.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(meeting.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                        style={{
                          background: "rgba(34,197,94,0.15)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }}
                      >
                        <Save size={16} />
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <X size={16} />
                        Vazgeç
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(meeting.id);
                          // format for datetime-local: YYYY-MM-DDThh:mm
                          const d = new Date(meeting.meeting_datetime);
                          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                          setEditDatetime(d.toISOString().slice(0, 16));
                        }}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                        style={{
                          background: "rgba(255,215,0,0.15)",
                          color: "#ffd700",
                          border: "1px solid rgba(255,215,0,0.2)",
                        }}
                      >
                        <Edit2 size={16} />
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeactivate(meeting.id)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                        style={{
                          background: "rgba(232,0,45,0.15)",
                          color: "#ff4d4d",
                          border: "1px solid rgba(232,0,45,0.2)",
                        }}
                      >
                        <Trash2 size={16} />
                        İptal
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px dotted rgba(255,255,255,0.1)" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>
              Henüz aktif bir buluşma planlanmadı.
            </p>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-white text-base mb-4">Yeni Buluşma Planla</h3>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              Başlık (isteğe bağlı)
            </label>
            <input 
              name="title" 
              type="text" 
              placeholder="ör: Akşam yemeği 🍕" 
              className="input-glass text-base py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              Tarih & Saat
            </label>
            <input 
              name="meeting_datetime" 
              type="datetime-local" 
              min={minDateTime} 
              required 
              className="input-glass text-base py-3" 
            />
          </div>
          <button type="submit" disabled={isPending} className="btn-gold w-full py-3.5 mt-2 text-base">
            {isPending ? (
              <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin mx-auto" />
            ) : (
              <><Plus size={20} /> Planla</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
