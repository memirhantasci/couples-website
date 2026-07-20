"use client";

import { useState } from "react";
import { toggleMedicineActiveAction, deleteMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { Trash2, Power, Clock, Edit2, User } from "lucide-react";
import { dayjs } from "@/lib/date";
import { EditMedicineModal } from "@/components/admin/EditMedicineModal";

export function AdminMedicineList({ medicines, logs, users }: { medicines: any[], logs: any[], users: any[] }) {
  const [loading, setLoading] = useState<number | null>(null);
  const [editingMed, setEditingMed] = useState<any | null>(null);

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
        const todayStr = dayjs().tz("Europe/Istanbul").format("YYYY-MM-DD");
        const todayLog = medLogs.find(l => l.date === todayStr);
        
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
            {/* Header / Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-white text-xl leading-tight">
                  {med.name}
                </h3>
                <div className="flex items-center mt-4">
                  <span className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ background: "rgba(255,215,0,0.15)", color: "var(--gs-gold)" }}>
                    <User size={18} />
                    {(() => {
                      const u = Array.isArray(med.user) ? med.user[0] : med.user;
                      return u?.display_name || u?.username || "Bilinmeyen";
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold shrink-0" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gs-gold)" }}>
                <Clock size={16} />
                <span className="text-sm">{med.time?.substring(0, 5)}</span>
              </div>
            </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full mt-2">
                <button
                  onClick={() => handleToggle(med.id, med.is_active)}
                  disabled={loading === med.id}
                  className="flex-1 h-24 rounded-2xl font-bold text-base transition-colors flex flex-col items-center justify-center gap-2"
                  style={{
                    background: med.is_active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.1)",
                    color: med.is_active ? "#4ade80" : "rgba(255,255,255,0.6)",
                  }}
                >
                  <Power size={28} />
                  {med.is_active ? "Aktif" : "Pasif"}
                </button>

                <button
                  onClick={() => setEditingMed(med)}
                  disabled={loading === med.id}
                  className="flex-1 h-24 rounded-2xl font-bold text-base transition-colors flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
                >
                  <Edit2 size={28} />
                  Düzenle
                </button>

                <button
                  onClick={() => handleDelete(med.id)}
                  disabled={loading === med.id}
                  className="flex-1 h-24 rounded-2xl font-bold text-base transition-colors flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                >
                  <Trash2 size={28} />
                  Sil
                </button>
              </div>

            {/* Today's Status Box */}
            <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: "rgba(0,0,0,0.2)" }}>
              <span className="text-sm font-semibold text-white/70">Bugünün Durumu:</span>
              {todayLog ? (
                <div className="flex items-center gap-2">
                  {todayLog.status === "DRANK" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded-md">Alındı</span>
                      {todayLog.taken_at && (
                        <span className="text-xs text-white/50">
                          {dayjs(todayLog.taken_at).tz("Europe/Istanbul").format("HH:mm:ss")}
                        </span>
                      )}
                    </div>
                  ) : todayLog.status === "MISSED" ? (
                    <span className="text-red-400 font-bold text-xs bg-red-400/10 px-2 py-1 rounded-md">Atlandı</span>
                  ) : (
                    <span className="text-yellow-400 font-bold text-xs bg-yellow-400/10 px-2 py-1 rounded-md">Bekliyor</span>
                  )}
                </div>
              ) : (
                <span className="text-white/40 font-bold text-xs bg-white/5 px-2 py-1 rounded-md">Henüz İşlem Yok</span>
              )}
            </div>

            {/* History Logs */}
            {medLogs.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Son Kayıtlar:
                </p>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {medLogs.slice(0, 7).map(log => (
                    <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <Clock size={14} style={{ color: "var(--gs-gold)" }} />
                      <span className="font-medium text-white/90 text-xs">
                        {dayjs(log.date).tz("Europe/Istanbul").format("DD MMM YYYY")}
                      </span>
                      {log.status === "DRANK" ? (
                        <div className="flex items-center gap-1.5 ml-auto">
                          {log.taken_at && (
                            <span className="text-[10px] text-white/40">{dayjs(log.taken_at).tz("Europe/Istanbul").format("HH:mm:ss")}</span>
                          )}
                          <span className="text-green-400 font-bold text-[10px] uppercase tracking-wider">İçildi</span>
                        </div>
                      ) : (
                        <span className="text-red-400 font-bold text-[10px] ml-auto uppercase tracking-wider">Atlandı</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {editingMed && (
        <EditMedicineModal 
          med={editingMed} 
          users={users} 
          onClose={() => setEditingMed(null)} 
        />
      )}
    </div>
  );
}
