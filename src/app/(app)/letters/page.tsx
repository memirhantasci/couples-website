import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Mail, Send, Inbox } from "lucide-react";
import { LetterList } from "@/components/letters/LetterList";
import { WriteLetterForm } from "@/components/letters/WriteLetterForm";

export const metadata: Metadata = {
  title: "Mektuplar — Zaman Kapsülü",
};

export const dynamic = "force-dynamic";

export default async function LettersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServerClient();

  const { data: receivedLetters } = await supabase
    .from("letters")
    .select(`
      *,
      sender:users!letters_sender_id_fkey(username, display_name)
    `)
    .eq("receiver_id", session.userId)
    .order("created_at", { ascending: false });

  const { data: sentLetters } = await supabase
    .from("letters")
    .select(`
      *,
      receiver:users!letters_receiver_id_fkey(username, display_name)
    `)
    .eq("sender_id", session.userId)
    .order("created_at", { ascending: false });

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, role, display_name")
    .neq("id", session.userId);

  if (usersError) console.error("Kullanıcıları çekerken hata:", usersError);

  const availableUsers = (users || []).filter(u => u.username !== "admin" && u.username !== "adminadmin");

  return (
    <div className="px-4 py-5 flex flex-col gap-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{ background: "rgba(245,200,66,0.12)", color: "var(--gs-gold)" }}
          >
            <Mail size={18} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Zaman Kapsülü
          </h1>
        </div>
        <p className="text-sm ml-[52px]" style={{ color: "var(--text-tertiary)" }}>
          Gelecekteki o özel güne mesaj bırak... 💌
        </p>
      </div>

      {/* Gelen Mektuplar */}
      <div className="flex flex-col gap-3">
        <h2 className="section-title flex items-center gap-2">
          <Inbox size={15} style={{ color: "var(--text-tertiary)" }} />
          Gelen Mektuplar
        </h2>
        <LetterList letters={receivedLetters || []} type="received" />
      </div>

      {/* Gönderilen Mektuplar */}
      <div className="flex flex-col gap-3">
        <h2 className="section-title flex items-center gap-2">
          <Send size={15} style={{ color: "var(--text-tertiary)" }} />
          Gönderdiğim Mektuplar
        </h2>
        <LetterList letters={sentLetters || []} type="sent" />
      </div>

      {/* Yeni Mektup Yaz Formu */}
      <WriteLetterForm users={availableUsers} />
    </div>
  );
}
