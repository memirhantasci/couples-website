import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AddMemoryForm } from "@/components/memories/AddMemoryForm";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Anı Yönetimi — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMemoriesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera size={20} style={{ color: "var(--gs-gold)" }} />
          Anı Yönetimi
        </h1>
      </div>

      <AddMemoryForm />
    </div>
  );
}
