"use client";

import { X, Eye, FileText, UploadCloud } from "lucide-react";

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

  const activeFields = fields.filter(f => f.label && f.label.trim() !== "");

  // Classes de style "Strict Professional"
  const labelStyle = "block text-[13px] font-semibold text-slate-900 mb-1.5";
  const inputBase = "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4">
      <div className="bg-white w-full max-w-2xl shadow-xl border border-slate-200 flex flex-col max-h-[85vh]">
        
        {/* HEADER : SOBRE & STATIQUE */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-slate-700" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Révision du formulaire de soumission
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY : CLARTÉ MAXIMALE */}
        <div className="p-8 overflow-y-auto space-y-8 bg-white">
          {activeFields.length > 0 ? (
            activeFields.map((field, index) => (
              <div key={index} className="max-w-xl mx-auto">
                <label className={labelStyle}>
                  {field.label}
                  {field.is_required && <span className="text-red-600 ml-1">*</span>}
                </label>

                {/* TEXTE COURT */}
                {field.type === "text" && (
                  <input type="text" className={inputBase} placeholder="Saisir votre texte..." />
                )}

                {/* TEXTE LONG */}
                {field.type === "textarea" && (
                  <textarea rows={4} className={inputBase} placeholder="Saisir votre réponse détaillée..." />
                )}

                {/* SELECT : SIMPLE & PRO */}
                {field.type === "select" && (
                  <select className={inputBase}>
                    <option value="">Sélectionner une option</option>
                    {(field.options || []).map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* UPLOADS : IMAGE, VIDEO, FILE */}
                {(field.type === "image" || field.type === "video" || field.type === "file") && (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">Cliquez pour téléverser</span> ou glisser-déposer
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">
                          {field.type} (Taille max: 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* CHECKBOX : ALIGNEMENT RIGOUREUX */}
                {field.type === "checkbox" && (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {(field.options || []).map((opt: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm text-slate-700 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Eye size={32} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 text-sm">Aucun champ configuré pour le moment.</p>
            </div>
          )}
        </div>

        {/* FOOTER : ACTIONS MINIMALISTES */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Quitter l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}