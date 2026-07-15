import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookText } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";

export const metadata: Metadata = {
  title: "Günlüğüm — Emirhan & Öykü 💕",
};

export const dynamic = "force-dynamic";

export default async function DailyNotesUserPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: notesResult } = await supabase
    .from("daily_notes")
    .select("id, date, content")
    .eq("user_id", session.userId)
    .order("date", { ascending: false });

  const notes = notesResult ?? [];

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center glow-red"
            style={{
              background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
            }}
          >
            <BookText size={20} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Günlüğüm</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              Sadece senin görebildiğin notların
            </p>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex flex-col gap-4">
        {notes.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <BookText size={40} className="mx-auto mb-3 opacity-20" />
            <p>Henüz günlüğüne hiçbir şey yazmadın.</p>
          </div>
        ) : (
          notes.map((note) => {
            const dateObj = dayjs(note.date).locale("tr");
            return (
              <div 
                key={note.id} 
                className="glass-card p-5 relative overflow-hidden" 
                style={{ borderRadius: "12px" }}
              >
                {/* Sol taraftaki şerit */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5" 
                  style={{ background: "var(--gs-gold)" }} 
                />
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gradient-gold">
                      {dateObj.format("DD")}
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--gs-gold)" }}>
                        {dateObj.format("MMMM")}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {dateObj.format("dddd, YYYY")}
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  className="text-base leading-relaxed whitespace-pre-wrap break-words"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {note.content}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Bottom spacer */}
      <div style={{ height: 20 }} />
    </div>
  );
}
