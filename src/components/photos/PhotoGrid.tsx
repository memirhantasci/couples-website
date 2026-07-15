"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ImageOff, X } from "lucide-react";
import { PhotoCard, type Photo } from "./PhotoCard";
import { Lightbox } from "./Lightbox";

interface PhotoGridProps {
  photos: Photo[];
  currentUserId: number;
  showFilters?: boolean;
  showSearch?: boolean;
  onRefresh?: () => void;
}

type FilterType = "newest" | "oldest" | "this_month" | "this_year" | "mine" | "partner";

export function PhotoGrid({
  photos,
  currentUserId,
  showFilters = true,
  showSearch = true,
  onRefresh,
}: PhotoGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("newest");
  const [customDate, setCustomDate] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let result = [...photos];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.taken_date.includes(q) ||
          (p.uploader?.display_name || p.uploader?.username || "").toLowerCase().includes(q)
      );
    }

    // Date filter
    if (customDate) {
      result = result.filter((p) => p.taken_date === customDate);
    } else {
      const now = new Date();
      if (filter === "this_month") {
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        result = result.filter((p) => p.taken_date.startsWith(`${year}-${month}`));
      } else if (filter === "this_year") {
        result = result.filter((p) => p.taken_date.startsWith(`${now.getFullYear()}`));
      } else if (filter === "mine") {
        result = result.filter((p) => p.user_id === currentUserId);
      } else if (filter === "partner") {
        result = result.filter((p) => p.user_id !== currentUserId);
      }
    }

    // Sort
    if (filter === "oldest") {
      result.sort((a, b) => {
        const da = `${a.taken_date}T${a.taken_time || "00:00"}`;
        const db = `${b.taken_date}T${b.taken_time || "00:00"}`;
        return da.localeCompare(db);
      });
    } else {
      result.sort((a, b) => {
        const da = `${a.taken_date}T${a.taken_time || "00:00"}`;
        const db = `${b.taken_date}T${b.taken_time || "00:00"}`;
        return db.localeCompare(da);
      });
    }

    return result;
  }, [photos, searchQuery, filter, customDate, currentUserId]);

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "this_month", label: "Bu Ay" },
    { key: "this_year", label: "Bu Yıl" },
    { key: "mine", label: "Benimkiler" },
    { key: "partner", label: "Partnerimin" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Search + Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col gap-3">
          {showSearch && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                type="text"
                placeholder="Başlık, açıklama veya tarih ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass text-sm"
                style={{ paddingLeft: 44 }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {showFilters && (
            <div className="flex flex-col gap-2">
              {/* Filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <SlidersHorizontal size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                {filterLabels.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setFilter(key); setCustomDate(""); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={
                      filter === key && !customDate
                        ? {
                            background: "var(--gs-red)",
                            color: "white",
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Custom date */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="input-glass text-xs flex-1"
                  style={{ colorScheme: "dark", padding: "8px 12px" }}
                />
                {customDate && (
                  <button
                    onClick={() => setCustomDate("")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Count */}
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
        {filtered.length} fotoğraf {filtered.length !== photos.length ? `(${photos.length} toplamdan)` : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ImageOff size={40} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            {searchQuery || customDate ? "Aramanıza uygun fotoğraf bulunamadı." : "Henüz fotoğraf yüklenmemiş."}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {filtered.map((photo, idx) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              currentUserId={currentUserId}
              onClick={() => setLightboxIndex(idx)}
              onUpdated={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
