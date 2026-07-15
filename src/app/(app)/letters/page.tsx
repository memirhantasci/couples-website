import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
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

  // Gelen Mektupları çek
  const { data: receivedLetters } = await supabase
    .from("letters")
    .select(`
      *,
      sender:users!letters_sender_id_fkey(username)
    `)
    .eq("receiver_id", session.userId)
    .order("created_at", { ascending: false });

  // Gönderilen Mektupları çek
  const { data: sentLetters } = await supabase
    .from("letters")
    .select(`
      *,
      receiver:users!letters_receiver_id_fkey(username)
    `)
    .eq("sender_id", session.userId)
    .order("created_at", { ascending: false });

  // Kullanıcıları çek (Kendisi hariç)
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, role")
    .neq("id", session.userId);
  
  if (usersError) console.error("Kullanıcıları çekerken hata:", usersError);
  
  // 'admin' isimli kullanıcıyı alıcı listesinden çıkarıyoruz
  const availableUsers = (users || []).filter(u => u.username !== "admin");

  return (
    <div className="px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail size={26} style={{ color: "var(--gs-gold)" }} />
          Zaman Kapsülü
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>
          Gelecekteki o özel güne mesaj bırak... 💌
        </p>
      </div>

      {/* Gelen Mektuplar */}
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-white text-lg">Gelen Mektuplar</h2>
        <LetterList letters={receivedLetters || []} type="received" />
      </div>

      {/* Gönderilen Mektuplar */}
      <div className="flex flex-col gap-3 mt-2">
        <h2 className="font-bold text-white text-lg">Gönderdiğim Mektuplar</h2>
        <LetterList letters={sentLetters || []} type="sent" />
      </div>

      {/* Yeni Mektup Yaz Formu */}
      <div className="mt-4">
        <WriteLetterForm users={availableUsers} />
      </div>
    </div>
  );
}
