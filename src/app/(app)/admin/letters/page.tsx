import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { AdminLetterList } from "@/components/admin/AdminLetterList";

export const metadata: Metadata = {
  title: "Tüm Mektuplar — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/home");

  const supabase = createServerClient();

  const { data: letters } = await supabase
    .from("letters")
    .select(`
      *,
      sender:users!letters_sender_id_fkey(username),
      receiver:users!letters_receiver_id_fkey(username)
    `)
    .order("created_at", { ascending: false });

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
          <Mail size={20} style={{ color: "var(--gs-gold)" }} />
          Tüm Mektuplar
        </h1>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white text-base mb-4">Sistemdeki Tüm Mektuplar</h2>
        <AdminLetterList letters={letters || []} />
      </div>
    </div>
  );
}
