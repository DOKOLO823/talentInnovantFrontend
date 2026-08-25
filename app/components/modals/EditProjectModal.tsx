"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, Loader2, Save } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedPost: any) => void;
  project: any;
  challenge: any;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onUpdated,
  project,
  challenge,
}: EditProjectModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pré-remplissage à l'ouverture du modal
  useEffect(() => {
    if (isOpen && project?.responses) {
      const initial: Record<string, any> = {};
      project.responses.forEach((r: any) => {
        const fieldId = r.challenge_field?.id ?? r.challengeField?.id;
        if (fieldId) initial[fieldId] = r.value; // string existante (texte ou chemin de fichier)
      });
      setFormData(initial);
      setErrors({});
      setGeneralError("");
    }
  }, [isOpen, project]);

  const fields =
    project?.responses?.map(
      (r: any) => r.challenge_field ?? r.challengeField,
    ) || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field: any) => {
      const value = formData[field.id];
      const isFileType = ["file", "image", "video"].includes(field.type);
      // Requis seulement si aucune valeur existante ET aucun nouveau fichier fourni
      if (field.is_required && !value) {
        newErrors[field.id] = "Ce champ est requis";
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldId];
        return n;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setGeneralError("");

    const payload = new FormData();
    fields.forEach((field: any, index: number) => {
      payload.append(
        `responses[${index}][challenge_field_id]`,
        field.id.toString(),
      );

      const value = formData[field.id];
      if (["file", "image", "video"].includes(field.type)) {
        // On n'envoie que si un NOUVEAU fichier a été choisi (instance de File)
        if (value instanceof File) {
          payload.append(`responses[${index}][value]`, value);
        }
        // Sinon : rien envoyé → le backend garde l'ancienne valeur (cf. update() corrigé)
      } else {
        payload.append(`responses[${index}][value]`, value ?? "");
      }
    });

    try {
      const response = await apiFetch(`/challenge/post/update/${project.id}`, {
        method: "POST",
        body: payload,
      });

      if (response?.statut === 200) {
        onUpdated(response.data);
      } else if (response?.statut === 422) {
        setGeneralError(
          typeof response.errors === "string"
            ? response.errors
            : Object.values(response.errors || {})
                .flat()
                .join(" "),
        );
      } else {
        setGeneralError(response?.message || "Une erreur est survenue.");
      }
    } catch (e) {
      setGeneralError("Erreur critique de connexion au serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const renderExistingFile = (field: any) => {
    const value = formData[field.id];
    if (!value || value instanceof File) return null;
    const fullUrl = value.startsWith("http") ? value : `${apifile}/${value}`;

    if (field.type === "image") {
      return (
        <img
          src={fullUrl}
          className="w-24 h-24 object-cover rounded-lg border mb-2"
          alt=""
        />
      );
    }
    if (field.type === "video") {
      return (
        <video controls className="w-full max-h-32 rounded-lg border mb-2">
          <source src={fullUrl} />
        </video>
      );
    }
    // file générique
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-xs text-orange-700 font-bold underline mb-2"
      >
        Voir le fichier actuel
      </a>
    );
  };

  const renderField = (field: any) => {
    const commonClasses =
      "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200 bg-white";
    const errorClasses = errors[field.id]
      ? "border-red-500 bg-red-50"
      : "border-gray-300";

    if (["file", "image", "video"].includes(field.type)) {
      return (
        <div className="space-y-2">
          {renderExistingFile(field)}
          <input
            type="file"
            accept={
              field.type === "image"
                ? "image/*"
                : field.type === "video"
                  ? "video/*"
                  : undefined
            }
            onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
            className={`${commonClasses} ${errorClasses} file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100`}
          />
          {formData[field.id] instanceof File && (
            <p className="text-xs text-gray-500">
              Nouveau fichier : {formData[field.id].name}
            </p>
          )}
          <p className="text-[11px] text-gray-400">
            Laissez vide pour conserver le fichier actuel.
          </p>
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses} min-h-[100px] resize-y`}
          />
        );
      case "option":
      case "select":
        let optionsList = [];
        try {
          optionsList =
            typeof field.option === "string"
              ? JSON.parse(field.option)
              : field.option;
        } catch {
          optionsList =
            typeof field.option === "string" ? field.option.split(",") : [];
        }
        return (
          <select
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          >
            <option value="">Sélectionner...</option>
            {Array.isArray(optionsList) &&
              optionsList.map((opt: string, idx: number) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
        );
      default:
        return (
          <input
            type={
              field.type === "email"
                ? "email"
                : field.type === "number"
                  ? "number"
                  : "text"
            }
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          />
        );
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-20 gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 truncate text-lg">
              Modifier mon projet
            </h2>
            <p className="text-xs text-gray-500 truncate">{challenge?.titre}</p>
          </div>
          {/* Bouton annuler — blanc, contour, texte noir */}
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-50 transition disabled:opacity-50 shrink-0"
          >
            <X size={16} />
            <span className="hidden xs:inline">Annuler</span>
          </button>
        </div>

        {/* Body */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar"
        >
          {generalError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium">
              {generalError}
            </div>
          )}

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field: any) => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {field.label}{" "}
                  {field.is_required === 1 && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div className="pt-4 px-4 pb-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row flex-wrap gap-3">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-[2] py-3 text-sm md:text-lg bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-700/20"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
