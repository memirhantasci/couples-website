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
    <div className="px-4 py-5 flex flex-col max-w-lg mx-auto" style={{ gap: "12px" }}>
      {/* Header */}
      <div className="mt-6">
        <h1 className="text-[32px] font-bold text-white leading-tight">
          Fotoğraf Yükle
        </h1>
      </div>

      {/* Form */}
      <PhotoUploadForm />
    </div>
  );
}
