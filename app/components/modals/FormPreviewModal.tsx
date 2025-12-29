"use client";

import { X } from "lucide-react";

export default function FormPreviewModal({
  open,
  onClose,
  fields,
}: {
  open: boolean;
  onClose: () => void;
  fields: any[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu du formulaire de participation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

          {fields
            .filter(f => f.label)
            .map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {/* TEXTE COURT */}
                {field.type === "text" && (
                  <input
                    disabled
                    className="input bg-gray-100 cursor-not-allowed"
                    placeholder="Réponse du participant"
                  />
                )}

                {/* TEXTE LONG */}
                {field.type === "textarea" && (
                  <textarea
                    disabled
                    rows={4}
                    className="textarea bg-gray-100 cursor-not-allowed"
                    placeholder="Réponse détaillée du participant"
                  />
                )}

                {/* IMAGE */}
                {field.type === "image" && (
                  <input
                    disabled
                    type="file"
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                )}

                {/* VIDEO */}
                {field.type === "video" && (
                  <input
                    disabled
                    type="file"
                    className="input bg-gray-100 cursor-not-allowed"
                    placeholder="Choisir la vidéo"
                  />
                )}

                {/* document  */}

                 {field.type === "file" && (
                  <input
                    disabled
                    type="file"
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                )}

                {/* SELECT */}
                {field.type === "select" && (
                  <select
                    disabled
                    className="select bg-gray-100 cursor-not-allowed"
                  >
                    <option>Sélectionner une option</option>
                    {(field.options || []).map(
                      (opt: string, i: number) => (
                        <option key={i}>{opt}</option>
                      )
                    )}
                  </select>
                )}

                {/* CHECKBOX */}
                {field.type === "checkbox" && (
                  <div className="space-y-2">
                    {(field.options || []).map(
                      (opt: string, i: number) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <input
                            disabled
                            type="checkbox"
                            className="cursor-not-allowed"
                          />
                          {opt}
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition"
          >
            Fermer l’aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
