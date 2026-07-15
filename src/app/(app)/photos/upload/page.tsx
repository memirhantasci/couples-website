import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Camera, ArrowLeft } from "lucide-react";
import { PhotoUploadForm } from "@/components/photos/PhotoUploadForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fotoğraf Yükle — Emirhan & Öykü 💕",
};

export default async function PhotoUploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/photos"
          className="p-2 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera size={22} style={{ color: "var(--gs-red)" }} />
            Fotoğraf Yükle
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2 }}>
            Bir anıyı arşive ekle 📸
          </p>
        </div>
      </div>

      {/* Form */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: "rgba(19, 19, 39, 0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        <PhotoUploadForm />
      </div>
    </div>
  );
}
