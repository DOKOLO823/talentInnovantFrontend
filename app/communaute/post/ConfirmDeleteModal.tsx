"use client";

// Emplacement : app/communaute/components/post/ConfirmDeleteModal.tsx
import { Loader2, Trash2 } from "lucide-react";
import ModalShell from "../components/common/ModalShell";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      locked={loading}
      panelClassName="sm:max-w-sm"
      zClass="z-[820]"
    >
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="text-red-600" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Supprimer ce projet ?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Le projet, ses fichiers, ses réactions et ses commentaires seront
          définitivement supprimés. Cette action est irréversible.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Supprimer"
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
