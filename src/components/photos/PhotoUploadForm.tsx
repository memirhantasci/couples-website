"use client";

import { useState, useRef, useCallback, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Calendar, Clock, AlignLeft, Type, Info, AlertCircle, CheckCircle, X, Image as ImageIcon } from "lucide-react";
import { uploadPhotoAction, type PhotoActionState } from "@/actions/photos";
import { toast } from "sonner";

const initialState: PhotoActionState = {};

export function PhotoUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadPhotoAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [exifStatus, setExifStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [takenDate, setTakenDate] = useState("");
  const [takenTime, setTakenTime] = useState("");
  const [exifFound, setExifFound] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Dosya boyutu çok büyük! Lütfen 1 MB'dan küçük bir fotoğraf seçin.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setExifStatus("loading");
    setTakenDate("");
    setTakenTime("");
    setExifFound(false);

    try {
      const exifr = (await import("exifr")).default;
      const exif = await exifr.parse(file); // parse all basic tags

      const dateValue = exif?.DateTimeOriginal || exif?.DateTime || exif?.CreateDate || exif?.ModifyDate;

      if (dateValue) {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) {
          const localDate = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
          const localTime = d.toTimeString().slice(0, 5); // HH:MM
          setTakenDate(localDate);
          setTakenTime(localTime);
          setExifFound(true);
          setExifStatus("found");
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback to file.lastModified (WhatsApp/Screenshots)
    if (file.lastModified) {
      const d = new Date(file.lastModified);
      if (!isNaN(d.getTime())) {
        setTakenDate(d.toLocaleDateString("en-CA"));
        setTakenTime(d.toTimeString().slice(0, 5));
        setExifFound(false);
        setExifStatus("not_found");
        return;
      }
    }

    setExifStatus("not_found");
  }, []);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="exif_found" value={String(exifFound)} />
      <input type="hidden" name="taken_date" value={takenDate} />
      <input type="hidden" name="taken_time" value={takenTime} />

      {/* File picker */}
      <div>
        <input
          ref={fileRef}
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          required
        />
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl transition-all"
          style={{
            border: preview ? "2px solid rgba(232,0,45,0.4)" : "2px dashed rgba(255,255,255,0.12)",
            background: preview ? "rgba(232,0,45,0.04)" : "rgba(255,255,255,0.02)",
            minHeight: 180,
            padding: 20,
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full"
              >
                <img
                  src={preview}
                  alt="Önizleme"
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: 300 }}
                />
                <div
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(8,8,17,0.8)", color: "rgba(255,255,255,0.7)" }}
                >
                  Değiştir
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(232,0,45,0.1)" }}
                >
                  <ImageIcon size={28} style={{ color: "var(--gs-red)" }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white text-sm">Fotoğraf Seç</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>
                    Galerinizden bir fotoğraf seçin
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: "rgba(232,0,45,0.15)", color: "var(--gs-red)" }}
                >
                  <Upload size={14} />
                  <span className="text-xs font-bold">Galeriyi Aç</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {fileName && (
          <p className="mt-2 text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
            📎 {fileName}
          </p>
        )}
      </div>

      {/* EXIF status */}
      <AnimatePresence>
        {exifStatus === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              EXIF bilgileri okunuyor...
            </span>
          </motion.div>
        )}

        {exifStatus === "found" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                Çekim bilgileri bulundu
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(34, 197, 94, 0.7)" }}>
                {takenDate} {takenTime && `saat ${takenTime}`} — İsterseniz düzenleyebilirsiniz.
              </p>
            </div>
          </motion.div>
        )}

        {exifStatus === "not_found" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <AlertCircle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: "#f59e0b" }}>
              Fotoğrafın kesin çekim tarihi bulunamadı ancak dosya tarihinden tahmin edildi. Lütfen doğruluğunu kontrol edin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date + Time fields (show if EXIF found for editing, or if not found for manual entry) */}
      <AnimatePresence>
        {(exifStatus === "found" || exifStatus === "not_found") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            {/* Taken Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Calendar size={12} />
                Çekim Tarihi {exifStatus === "not_found" ? "*" : "(düzenleyebilirsiniz)"}
              </label>
              <input
                type="date"
                value={takenDate}
                onChange={(e) => setTakenDate(e.target.value)}
                required
                className="input-glass text-sm"
              />
            </div>

            {/* Taken Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Clock size={12} />
                Çekim Saati (isteğe bağlı)
              </label>
              <input
                type="time"
                value={takenTime}
                onChange={(e) => setTakenTime(e.target.value)}
                className="input-glass text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
          <Type size={12} />
          Başlık (isteğe bağlı)
        </label>
        <input
          name="title"
          type="text"
          placeholder="Fotoğrafınıza bir başlık verin..."
          className="input-glass text-sm"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
          <AlignLeft size={12} />
          Açıklama *
        </label>
        <textarea
          name="description"
          rows={4}
          required
          placeholder="Bu anı anlatın... Neredeydiniz, ne hissettiniz?"
          className="input-glass text-sm resize-none"
          style={{ lineHeight: 1.7 }}
        />
      </div>

      {/* Info */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-[12px]"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Info size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}>
          Yüklenen fotoğraflar kalıcı olarak saklanır ve silinemez. Her iki kullanıcı da tüm fotoğrafları görebilir.
        </p>
      </div>

      {/* Error */}
      {state?.error && (
        <div
          className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{
            background: "rgba(232,0,45,0.1)",
            border: "1px solid rgba(232,0,45,0.25)",
            color: "#FF4D6D",
          }}
        >
          <X size={14} />
          {state.error}
        </div>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isPending || !preview || !takenDate}
        whileHover={{ scale: (isPending || !preview || !takenDate) ? 1 : 1.01 }}
        whileTap={{ scale: (isPending || !preview || !takenDate) ? 1 : 0.99 }}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background:
            isPending || !preview || !takenDate
              ? "rgba(255,255,255,0.08)"
              : "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
          color: isPending || !preview || !takenDate ? "rgba(255,255,255,0.3)" : "white",
          cursor: isPending || !preview || !takenDate ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Yükleniyor...
          </>
        ) : (
          <>
            <Camera size={16} />
            Fotoğrafı Kaydet
          </>
        )}
      </motion.button>

      {!preview && (
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Kaydetmek için önce bir fotoğraf seçin
        </p>
      )}
    </form>
  );
}
