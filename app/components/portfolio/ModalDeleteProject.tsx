"use client";

import { X } from "lucide-react";

interface Props {
  project: any;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalDeleteProject({
  project,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto pt-32">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm">

        <h2 className="text-lg font-semibold">Supprimer ce projet ?</h2>
        <p className="text-gray-600 mt-2">{project.titre}</p>

        <div className="flex justify-end gap-3 mt-5">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Annuler
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={onConfirm}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
