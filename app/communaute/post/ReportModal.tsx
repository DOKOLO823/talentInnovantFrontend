"use client";

// Emplacement : app/communaute/components/post/ReportModal.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import ModalShell from "../components/common/ModalShell";
import { REPORT_REASONS } from "../lib/Constants";

export default function ReportModal({
  open,
  onClose,
  postId,
}: {
  open: boolean;
  onClose: () => void;
  postId: number;
}) {
  const [motif, setMotif] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!motif) return toast.error("Choisissez un motif.");
    setSending(true);
    try {
      const res = await apiFetch(`/communaute/posts/${postId}/signalement`, {
        method: "POST",
        body: JSON.stringify({ motif, details: details.trim() || null }),
      });
      if (res?.statut === 200) {
        toast.success(res.message || "Signalement transmis.");
        setMotif("");
        setDetails("");
        onClose();
      } else {
        toast.error(res?.message || "Signalement impossible.");
      }
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      locked={sending}
      title="Signaler ce projet"
      panelClassName="sm:max-w-md"
      zClass="z-[820]"
    >
      <div className="p-5">
        <p className="mb-3 text-sm text-slate-500">
          Pourquoi signalez-vous ce projet ? Votre signalement reste
          confidentiel.
        </p>

        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                motif === r.value
                  ? "border-orange-500 bg-orange-50 font-semibold text-orange-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="motif"
                value={r.value}
                checked={motif === r.value}
                onChange={() => setMotif(r.value)}
                className="accent-orange-700"
              />
              {r.label}
            </label>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Détails (facultatif)"
          className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
        />

        <button
          onClick={send}
          disabled={sending || !motif}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 py-3 text-sm font-bold text-white transition hover:bg-orange-800 disabled:opacity-50"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Envoyer le signalement"
          )}
        </button>
      </div>
    </ModalShell>
  );
}
