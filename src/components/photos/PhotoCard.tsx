"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Clock, User, Edit2 } from "lucide-react";
import { PhotoEditModal } from "./PhotoEditModal";

export interface Photo {
  id: string;
  user_id: number;
  image_url: string;
  storage_path: string;
  title: string | null;
  description: string;
  taken_date: string;
  taken_time: string | null;
  uploaded_at: string;
  exif_found: boolean;
  uploader?: { username: string; display_name?: string };
}

interface PhotoCardProps {
  photo: Photo;
  currentUserId: number;
  onClick: (photo: Photo) => void;
  onUpdated?: () => void;
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
  return timeStr.substring(0, 5); // HH:MM
}

export function PhotoCard({ photo, currentUserId, onClick, onUpdated }: PhotoCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isOwner = photo.user_id === currentUserId;
  const uploaderName = photo.uploader?.display_name || photo.uploader?.username || "Bilinmiyor";
  const time = formatTime(photo.taken_time);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25 }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: "rgba(19, 19, 39, 0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
        }}
        onClick={() => onClick(photo)}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img
            src={photo.image_url}
            alt={photo.title || photo.description}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: "50%",
              background: "linear-gradient(to top, rgba(8,8,17,0.85) 0%, transparent 100%)",
            }}
          />
          {/* Edit button for owner */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="absolute top-3 right-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{
                background: "rgba(232, 0, 45, 0.85)",
                backdropFilter: "blur(8px)",
              }}
              title="Düzenle"
            >
              <Edit2 size={14} color="white" />
            </button>
          )}
          {/* Date badge */}
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(8, 8, 17, 0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Camera size={11} style={{ color: "var(--gs-red)" }} />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600 }}>
              {formatDate(photo.taken_date)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2">
          {photo.title && (
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-1">
              {photo.title}
            </h3>
          )}
          <p
            className="text-xs line-clamp-2 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {photo.description}
          </p>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <User size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{uploaderName}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                <Clock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{time}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {editOpen && (
        <PhotoEditModal
          photo={photo}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            onUpdated?.();
          }}
        />
      )}
    </>
  );
}
