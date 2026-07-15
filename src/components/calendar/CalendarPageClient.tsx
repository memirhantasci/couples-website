"use client";

import { useState } from "react";
import { LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { CalendarView } from "@/components/calendar/CalendarView";
import type { Photo } from "@/components/photos/PhotoCard";

interface CalendarPageClientProps {
  notes: any[];
  moods: any[];
  photos: Photo[];
  currentUserId: number;
  currentUsername: string;
}

export function CalendarPageClient({ notes, moods, photos, currentUserId, currentUsername }: CalendarPageClientProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "grid">("calendar");

  const photoDates = [...new Set(photos.map((p) => p.taken_date))];

  return (
    <div className="flex flex-col gap-5">
      {/* Toggle View */}
      <div className="flex bg-white/5 p-1 rounded-xl w-full max-w-[240px] mx-auto mb-2">
        <button
          onClick={() => setViewMode("calendar")}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: viewMode === "calendar" ? "var(--gs-red)" : "transparent",
            color: viewMode === "calendar" ? "white" : "rgba(255,255,255,0.5)",
          }}
        >
          <CalendarIcon size={16} /> Takvim
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: viewMode === "grid" ? "var(--gs-red)" : "transparent",
            color: viewMode === "grid" ? "white" : "rgba(255,255,255,0.5)",
          }}
        >
          <LayoutGrid size={16} /> Fotoğraflar
        </button>
      </div>

      {viewMode === "calendar" ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <CalendarView
            notes={notes}
            moods={moods}
            currentUsername={currentUsername}
            photoDates={photoDates}
            disableNotes={false}
          />
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <PhotoGrid
            photos={photos}
            currentUserId={currentUserId}
            showSearch
            showFilters
          />
        </div>
      )}
    </div>
  );
}
