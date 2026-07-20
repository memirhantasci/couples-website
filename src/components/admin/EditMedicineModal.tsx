"use client";

import { X, Pill, Save } from "lucide-react";
import { editMedicineAction } from "@/actions/medicine";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function EditMedicineModal({ 
  med, 
  users, 
  onClose 
}: { 
  med: any; 
  users: any[]; 
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      time: formData.get("time") as string,
      user_id: Number(formData.get("user_id")),
    };

    // Değişiklik kontrolü
    const isNameSame = data.name.trim() === med.name;
    const isStartSame = data.start_date === (med.start_date ? med.start_date.substring(0, 10) : "");
    const isEndSame = data.end_date === (med.end_date ? med.end_date.substring(0, 10) : "");
    const isTimeSame = data.time === (med.time ? med.time.substring(0, 5) : "");
    const isUserSame = data.user_id === med.user_id;

    if (isNameSame && isStartSame && isEndSame && isTimeSame && isUserSame) {
      toast.info("Herhangi bir değişiklik yapmadınız.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await editMedicineAction(med.id, data);
      setSubmitting(false);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("İlaç başarıyla güncellendi.");
        onClose();
      }
    } catch (err) {
      setSubmitting(false);
      toast.error("Sunucu ile iletişim kurulamadı veya beklenmeyen bir hata oluştu.");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    background: "var(--surface-1)",
    border: "1.5px solid var(--border-default)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "bold",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "6px",
    display: "block",
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.70)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--surface-2)",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={16} />
        </button>

        <h3
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Pill size={20} style={{ color: "var(--gs-red)" }} />
          İlacı Düzenle
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>İlaç Adı</label>
            <input
              name="name"
              type="text"
              defaultValue={med.name}
              required
              style={inputStyle}
            />
          </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Başlangıç</label>
                <input
                  name="start_date"
                  type="date"
                  defaultValue={med.start_date?.substring(0, 10)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Bitiş</label>
                <input
                  name="end_date"
                  type="date"
                  defaultValue={med.end_date?.substring(0, 10)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

          <div>
            <label style={labelStyle}>Saat</label>
            <input
              name="time"
              type="time"
              defaultValue={med.time?.substring(0, 5)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Kullanıcı</label>
            <select
              name="user_id"
              defaultValue={med.user_id}
              required
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Seçiniz</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                background: submitting ? "rgba(255,255,255,0.1)" : "var(--gs-red)",
                color: submitting ? "rgba(255,255,255,0.3)" : "white",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Save size={18} />
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
