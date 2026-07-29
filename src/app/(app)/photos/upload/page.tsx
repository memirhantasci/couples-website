import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PhotoUploadForm } from "@/components/photos/PhotoUploadForm";

export const metadata: Metadata = {
  title: "Fotoğraf Yükle — Emirhan & Öykü 💕",
};

export default async function PhotoUploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: "var(--gs-red)", fontSize: 20 }}>❤️</span>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Fotoğraf Yükle
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Bir anıyı arşive ekle 📸
        </p>
      </div>

      {/* Form */}
      <PhotoUploadForm />
    </div>
  );
}
