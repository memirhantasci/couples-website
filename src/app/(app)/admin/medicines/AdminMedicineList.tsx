"use client";

import { useState } from "react";
import { toggleMedicineActiveAction, deleteMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Trash2, Power, Clock } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
dayjs.locale("tr");

export function AdminMedicineList({ medicines, logs }: { medicines: any[], logs: any[] }) {
  const [loading, setLoading] = useState<number | null>(null);

  async function handleToggle(id: number, currentStatus: boolean) {
    setLoading(id);
    const res = await toggleMedicineActiveAction(id, !currentStatus);
    setLoading(null);
    if (res?.error) toast.error(res.error);
    else toast.success(currentStatus ? "İlaç pasif yapıldı." : "İlaç aktif edildi.");
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu ilacı tamamen silmek istediğine emin misin?")) return;
    setLoading(id);
    const res = await deleteMedicineAction(id);
    setLoading(null);
    if (res?.error) toast.error(res.error);
    else toast.success("İlaç başarıyla silindi.");
  }

  if (!medicines.length) {
    return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Hiç ilaç bulunamadı.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {medicines.map(med => {
        const medLogs = logs.filter(l => l.medicine_id === med.id);
        
        return (
          <div
            key={med.id}
            className="p-4 rounded-xl flex flex-col gap-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: med.is_active ? 1 : 0.6,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-lg">{med.name}</p>
                <p className="font-medium mt-1" style={{ color: "var(--gs-gold)", fontSize: 14 }}>
                  {med.time} • {med.start_date} / {med.end_date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(med.id, med.is_active)}
                  disabled={loading === med.id}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  style={{
                    background: med.is_active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.1)",
                    color: med.is_active ? "#4ade80" : "rgba(255,255,255,0.6)",
                  }}
                >
                  <Power size={18} />
                  {med.is_active ? "Aktif" : "Pasif"}
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  disabled={loading === med.id}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                >
                  <Trash2 size={18} />
                  Sil
                </button>
              </div>
            </div>

            {medLogs.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  İlaç Alım Geçmişi:
                </p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {medLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-sm">
                      <Clock size={14} style={{ color: "var(--gs-gold)" }} />
                      <span className="font-medium text-white/90">
                        {dayjs(log.taken_at).format("DD MMMM YYYY")}
                      </span>
                      <span className="text-white/50">
                        saat {dayjs(log.taken_at).format("HH:mm")}
                      </span>
                      {log.status === "drank" ? (
                        <span className="text-green-400 font-semibold text-xs ml-auto bg-green-400/10 px-2 py-0.5 rounded-md">Alındı</span>
                      ) : (
                        <span className="text-red-400 font-semibold text-xs ml-auto bg-red-400/10 px-2 py-0.5 rounded-md">Alınmadı</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
