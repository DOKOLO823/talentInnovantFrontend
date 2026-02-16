"use client";

import { useState } from "react";
import {
  Upload,
  X,
  Info,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Target,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface StepGeneralInfoProps {
  data: any;
  onChange: (data: any) => void;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  onNext: () => void;
}

export default function StepGeneralInfo({
  data,
  onChange,
  photoFile,
  setPhotoFile,
  onNext,
}: StepGeneralInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: any) => {
    if (errors[key]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[key];
        return newErrs;
      });
    }
    onChange({ ...data, [key]: value });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    // Validation Titre (Required | Max 255)
    if (!data.titre?.trim()) {
      newErrors.titre = "Le titre est obligatoire";
    } else if (data.titre.length > 250) {
      newErrors.titre = "Le titre ne doit pas dépasser 250 caractères";
    }

    // Validation Objectif (Max 250 - Optionnel selon backend nullable)
    if (data.objectif && data.objectif.length > 500) {
      newErrors.objectif = "L'objectif ne doit pas dépasser 500 caractères";
    }

    // theme
    if (data.theme && data.theme.length > 250) {
      newErrors.theme = "Le thème ne doit pas dépasser 250 caractères";
    }
    // description
    if (data.description && data.description.length > 900) {
      newErrors.description =
        "La description ne doit pas dépasser 900 caractères";
    }
    // details
    if (data.details && data.details.length > 1000) {
      newErrors.details = "Les détails ne doivent pas dépasser 1000 caractères";
    }

    setErrors(newErrors);

    // LOGIQUE DE TOAST : On affiche la première erreur trouvée
    if (Object.keys(newErrors).length > 0) {
      const firstErrorMessage = Object.values(newErrors)[0];
      toast.error(firstErrorMessage, {
        style: {
          color: "red",
          fontSize: "15px",
          fontWeight: "bold",
          // textTransform: 'uppercase',
        },
      });
      return false;
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Format non supporté. Utilisez JPG, PNG ou WEBP.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 2 MB.");
        return;
      }
      setPhotoFile(file);
    }
  };

  const removePhoto = () => setPhotoFile(null);

  // Styles Enterprise Strict
  const labelStyle =
    "block text-[12px] font-bold uppercase tracking-tight text-slate-900 mb-1.5";
  const inputStyle =
    "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all placeholder:text-slate-400";
  const errorInputStyle =
    "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30";
  const cardStyle =
    "bg-white border border-slate-200 rounded-md p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* HEADER ÉPURÉ */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText size={20} className="text-slate-400" />
          Informations générales
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Définissez les bases de votre challenge pour une visibilité maximale.
        </p>
      </div>

      <div className="space-y-6">
        {/* TITRE, THEME & OBJECTIF */}
        <div className={cardStyle}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>
                Titre du challenge <span className="text-orange-700">*</span>
              </label>
              <input
                className={`${inputStyle} ${errors.titre ? errorInputStyle : ""}`}
                placeholder="Ex: Hackathon Innovation IA 2026"
                value={data.titre || ""}
                onChange={(e) => update("titre", e.target.value)}
              />
              {errors.titre && (
                <p className="text-red-600 text-[10px] font-bold uppercase flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.titre}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Thématique</label>
              <input
                className={inputStyle}
                placeholder="Ex: Santé & Intelligence Artificielle"
                value={data.theme || ""}
                onChange={(e) => update("theme", e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className={labelStyle}>Objectif du challenge</label>
              <input
                className={`${inputStyle} ${errors.objectif ? errorInputStyle : ""}`}
                placeholder="Ex: Recruter les meilleurs talents en Data Science ou booster l'innovation interne"
                value={data.objectif || ""}
                onChange={(e) => update("objectif", e.target.value)}
              />
              {errors.objectif && (
                <p className="text-red-600 text-[10px] font-bold uppercase flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.objectif}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* DESCRIPTION DÉTAILLÉE */}
        <div className={cardStyle}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className={labelStyle}>Description du projet</label>
              <textarea
                rows={6}
                className={`${inputStyle} resize-none leading-relaxed`}
                placeholder="Décrivez les objectifs, le contexte et les livrables attendus..."
                value={data.description || ""}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Détails complémentaires</label>
              <textarea
                rows={2}
                className={`${inputStyle} resize-none`}
                placeholder="Notes additionnelles, ressources utiles..."
                value={data.details || ""}
                onChange={(e) => update("details", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* VISUEL */}
        <div className={cardStyle}>
          <label className={labelStyle}>Identité Visuelle (Banner)</label>
          {!photoFile ? (
            <label className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-orange-700 hover:bg-orange-50/30 rounded-md p-8 transition-all cursor-pointer bg-slate-50/50">
              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Upload className="w-5 h-5 text-orange-700" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Sélectionner un fichier
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">
                  JPG, PNG, WEBP — MAX 2MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                hidden
                onChange={handlePhotoChange}
              />
            </label>
          ) : (
            <div className="flex items-center gap-5 p-3 border border-orange-700/20 bg-orange-50/30 rounded-md">
              <div className="relative w-20 h-20 rounded border border-slate-200 overflow-hidden bg-white shrink-0">
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-orange-700" />
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {photoFile.name}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">
                  {(photoFile.size / 1024).toFixed(0)} KB
                </p>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="mt-2 text-[11px] font-black text-red-600 hover:underline uppercase tracking-tighter"
                >
                  Retirer le visuel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 text-slate-400">
          <Info size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Étape 1 sur 4
          </span>
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="bg-orange-700 text-white px-8 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all active:scale-[0.98] shadow-sm flex items-center gap-3"
        >
          Continuer
          <span className="text-orange-300 font-normal">→</span>
        </button>
      </div>
    </div>
  );
}
