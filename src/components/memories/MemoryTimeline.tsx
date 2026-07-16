"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatDateTR } from "@/lib/date";
import { Trash2 } from "lucide-react";
import { deleteMemoryAction } from "@/actions/memories";
import { toast } from "sonner";

interface Memory {
  id: number;
  date: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  is_default?: boolean;
}

// Map memory titles to emojis
function getMemoryEmoji(title: string): string {
  if (title.toLowerCase().includes("tanış")) return "💫";
  if (title.toLowerCase().includes("sevgili")) return "💕";
  if (title.toLowerCase().includes("doğum")) return "🎂";
  if (title.toLowerCase().includes("sevgililer")) return "❤️";
  if (title.toLowerCase().includes("halloween")) return "🎃";
  if (title.toLowerCase().includes("yılbaşı")) return "🎆";
  return "📸";
}

interface MemoryTimelineProps {
  memories: Memory[];
  isAdmin: boolean;
}

export function MemoryTimeline({ memories, isAdmin }: MemoryTimelineProps) {
  async function handleDelete(id: number) {
    if (!confirm("Bu anıyı silmek istediğinize emin misiniz?")) return;
    const result = await deleteMemoryAction(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Anı silindi.");
    }
  }

  if (memories.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-16 rounded-[20px]"
        style={{
          background: "var(--surface-2)",
          border: "1px dashed var(--border-default)",
        }}
      >
        <span className="text-5xl">📸</span>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Henüz anı eklenmedi
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical line */}
      <div
        className="absolute"
        style={{
          left: 20,
          top: 20,
          bottom: 20,
          width: 2,
          background:
            "linear-gradient(180deg, var(--gs-red) 0%, var(--gs-gold) 50%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      {memories.map((memory, index) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="relative flex gap-4 pb-6"
        >
          {/* Dot */}
          <div
            className="timeline-dot z-10 relative flex-shrink-0"
            style={{ marginTop: 4 }}
          >
            <span style={{ fontSize: 18 }}>{getMemoryEmoji(memory.title)}</span>
          </div>

          {/* Card */}
          <div
            className="flex-1 card p-4 relative"
            style={{ marginLeft: 4 }}
          >
            {/* Date badge */}
            <span
              className="badge badge-gold mb-2 inline-flex"
              style={{ fontSize: 10 }}
            >
              {formatDateTR(memory.date)}
            </span>

            <h3 className="font-bold text-white text-base mb-1">
              {memory.title}
            </h3>

            {memory.description && (
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: "var(--text-secondary)", fontSize: 14 }}
              >
                {memory.description}
              </p>
            )}

            {/* Image */}
            {memory.image_url && (
              <div
                className="relative rounded-xl overflow-hidden mt-2"
                style={{ height: 180 }}
              >
                <Image
                  src={memory.image_url}
                  alt={memory.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 500px) 100vw, 500px"
                />
              </div>
            )}

            {/* Admin delete button (non-default memories only) */}
            {isAdmin && !memory.is_default && (
              <button
                onClick={() => handleDelete(memory.id)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{
                  background: "rgba(232,0,45,0.1)",
                  color: "rgba(232,0,45,0.6)",
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
