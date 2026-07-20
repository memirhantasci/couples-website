"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteDailyNoteAction } from "@/actions/notes";
import { deleteLetterAction } from "@/actions/letters";
import { deleteCalendarNoteAdminAction } from "@/actions/meetings";

export function DeleteDailyNoteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu günlük notu silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteDailyNoteAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Günlük not başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.15)",
        color: "#ff4d4d",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Sil"}
    </button>
  );
}

export function DeleteLetterButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu mektubu silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteLetterAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Mektup başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.1)",
        color: "#d32f2f",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Mektubu Sil"}
    </button>
  );
}

export function DeleteCalendarEventButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu takvim etkinliğini silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteCalendarNoteAdminAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Etkinlik başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.15)",
        color: "#ff4d4d",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Etkinliği Sil"}
    </button>
  );
}
