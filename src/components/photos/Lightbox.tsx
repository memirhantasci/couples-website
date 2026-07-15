"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Clock, User, ZoomIn, ZoomOut, HardDrive } from "lucide-react";
import type { Photo } from "./PhotoCard";

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null): string | null {
  if (!timeStr) return null;
  return timeStr.substring(0, 5);
}

function formatBytes(bytes?: number | null): string | null {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return null;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const photo = photos[currentIndex];
  const uploaderName = photo.uploader?.display_name || photo.uploader?.username || "Bilinmiyor";

  const goNext = useCallback(() => {
    setZoom(1);
    setLoaded(false);
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setZoom(1);
    setLoaded(false);
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(4, z - e.deltaY * 0.002)));
  };

  // Double click zoom
  const handleDoubleClick = () => {
    setZoom((z) => z === 1 ? 2.5 : 1);
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  const time = formatTime(photo.taken_time);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: "rgba(4, 4, 12, 0.96)", backdropFilter: "blur(20px)" }}
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))}
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, minWidth: 40, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Counter */}
          <span
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {currentIndex + 1} / {photos.length}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: "rgba(232, 0, 45, 0.2)", color: "#ff6b6b" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main image area */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden select-none"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          {/* Prev arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 z-10 p-3 rounded-2xl transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
              }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full h-full px-16"
            >
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
              )}
              <img
                ref={imgRef}
                src={photo.image_url}
                alt={photo.title || photo.description}
                onLoad={() => setLoaded(true)}
                className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-zoom-in"
                style={{
                  transform: `scale(${zoom})`,
                  opacity: loaded ? 1 : 0,
                  maxHeight: "calc(100vh - 240px)",
                  borderRadius: 12,
                  boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Next arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 z-10 p-3 rounded-2xl transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
              }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Bottom info panel */}
        <div
          className="flex-shrink-0 px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-2xl mx-auto">
            {photo.title && (
              <h2 className="font-bold text-white text-base mb-1">{photo.title}</h2>
            )}
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              {photo.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Camera size={13} style={{ color: "var(--gs-red)" }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  {formatDate(photo.taken_date)}
                </span>
              </div>
              {time && (
                <div className="flex items-center gap-1.5">
                  <Clock size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{time}</span>
                </div>
              )}
              {photo.file_size != null && (
                <div className="flex items-center gap-1.5">
                  <HardDrive size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    {formatBytes(photo.file_size)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{uploaderName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        {photos.length > 1 && photos.length <= 20 && (
          <div className="flex items-center justify-center gap-1.5 pb-4" onClick={(e) => e.stopPropagation()}>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setZoom(1); setLoaded(false); setCurrentIndex(i); }}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentIndex ? 20 : 6,
                  height: 6,
                  background: i === currentIndex ? "var(--gs-red)" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
