import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Images } from "lucide-react";
import { PhotosPageClient } from "@/components/photos/PhotosPageClient";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fotoğraf Arşivi — Emirhan & Öykü 💕",
  description: "Birlikte yaşanan anıların fotoğraf arşivi",
};

export const dynamic = "force-dynamic";

export default async function PhotoArchivePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: photos, error } = await supabase
    .from("photo_archive")
    .select(`
      id, user_id, image_url, storage_path, title, description,
      taken_date, taken_time, uploaded_at, exif_found,
      uploader:users(username, display_name)
    `)
    .order("taken_date", { ascending: false })
    .order("taken_time", { ascending: false });

  if (error) console.error("Photos fetch error:", error);

  const photoList = (photos as any[]) ?? [];

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Images size={22} style={{ color: "var(--gs-red)" }} />
            Fotoğraf Arşivi
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            {photoList.length} fotoğraf • birlikte yaşanan anılar 📸
          </p>
        </div>
        <Link
          href="/photos/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
            color: "white",
          }}
        >
          + Yükle
        </Link>
      </div>

      {/* Toggle View (Calendar / Grid) */}
      <PhotosPageClient
        photos={photoList}
        currentUserId={session.userId}
        currentUsername={session.username}
      />
    </div>
  );
}
