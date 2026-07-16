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
          className="flex items-center justify-center rounded-[12px] transition-all active:scale-95"
          style={{
            width: 40,
            height: 40,
            background: "var(--surface-3)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: "rgba(232,0,45,0.12)", color: "var(--gs-red)" }}
            >
              <Camera size={16} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Fotoğraf Yükle
            </h1>
          </div>
          <p className="text-xs mt-1 ml-[44px]" style={{ color: "var(--text-tertiary)" }}>
            Bir anıyı arşive ekle 📸
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-5">
        <PhotoUploadForm />
      </div>
    </div>
  );
}
