"use client";

import { useState, useEffect } from "react";
import { X, Loader2, FileText } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

interface FormField {
  id: number;
  label: string;
  type: string;
  is_required: number;
  option: any;
}

export default function ProjectFormPreviewModal({
  isOpen,
  onClose,
  challenge,
}: {
  isOpen: boolean;
  onClose: () => void;
  challenge: any;
}) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadFields();
    }
  }, [isOpen]);

  const loadFields = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/challenges/champs/${challenge.id}`);
      if (response && response.statut === 200) {
        setFields(response.data.fields);
      } else {
        setError("Impossible de charger les champs du formulaire.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderPreviewField = (field: FormField) => {
    const commonClasses =
      "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200 bg-white text-gray-700";

    if (field.type === "file") {
      return (
        <div className="space-y-2">
          <div className={`${commonClasses} flex items-center gap-3 bg-gray-50 border-dashed cursor-pointer`}>
            <FileText size={18} className="text-orange-600" />
            <span className="text-sm text-gray-500">Choisir un fichier (max 30 Mo)</span>
          </div>
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className={`${commonClasses} min-h-[100px] resize-y`}
            placeholder={`Votre réponse ici...`}
            readOnly
          />
        );
      case "option":
      case "select":
        let optionsList = [];
        try {
          optionsList = typeof field.option === "string" ? JSON.parse(field.option) : field.option;
        } catch (e) {
          optionsList = field.option?.split(",") || [];
        }

        return (
          <select className={commonClasses} defaultValue="">
            <option value="" disabled>Sélectionner...</option>
            {Array.isArray(optionsList) && optionsList.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type === "number" ? "number" : "text"}
            className={commonClasses}
            placeholder={`Saisir ${field.label.toLowerCase()}`}
            readOnly
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <img src={challenge.photo} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 text-lg line-clamp-2">{challenge.titre}</h2>
              <p className="text-xs text-gray-500">Aperçu du formulaire de participation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-orange-600" />
              <p className="text-sm text-gray-500">Chargement des champs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 font-medium">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <p className="text-xs text-orange-700 font-medium leading-tight">
                  Voici les informations qui seront demandées aux participants pour ce challenge. 
                </p>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700">
                      {field.label} {field.is_required === 1 && <span className="text-red-500">*</span>}
                    </label>
                    {renderPreviewField(field)}
                  </div>
                ))}
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition duration-200 shadow-lg"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}