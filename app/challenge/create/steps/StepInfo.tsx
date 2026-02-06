"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Gavel, Trophy, BarChart3, Users2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface StepDetailsChallengeProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  forCreate : Boolean;
}

export default function StepDetailsChallenge({
  data,
  onChange,
  onNext,
  onBack,
  isSubmitting,
  onSubmit,
  forCreate
}: StepDetailsChallengeProps) {
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

  const updateArrayItem = (key: string, index: number, value: string) => {
    const currentArray = Array.isArray(data[key]) ? [...data[key]] : [""];
    currentArray[index] = value;
    update(key, currentArray);
  };

  const addArrayItem = (key: string) => {
    const currentArray = Array.isArray(data[key]) ? [...data[key]] : [""];
    update(key, [...currentArray, ""]);
  };

  const removeArrayItem = (key: string, index: number) => {
    const currentArray = Array.isArray(data[key]) ? [...data[key]] : [""];
    const filtered = currentArray.filter((_: any, i: number) => i !== index);
    update(key, filtered.length > 0 ? filtered : [""]);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    // Validation RECOMPENSE : Obligatoire (au moins un item non vide)
    const rewards = data.recompense || [];
    const hasValidReward = rewards.some((r: string) => r.trim() !== "");

    if (!hasValidReward) {
      newErrors.recompense = "Au moins une récompense est obligatoire pour continuer";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(newErrors.recompense, {
        style: { fontSize: '15px', fontWeight: 'bold', color:'red' }
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const sections = [
    {
      key: "principe",
      title: "Règles du challenge",
      icon: <Gavel size={16} className="text-slate-400" />,
      placeholder: "Ex: Équipes de 2 à 5 personnes maximum",
      description: "Cadre réglementaire et contraintes logistiques.",
      required: false
    },
    {
      key: "recompense",
      title: "Récompenses & Dotations",
      icon: <Trophy size={16} className="text-slate-400" />,
      placeholder: "Ex: 2 000 000 FCFA + accompagnement",
      description: "Détaillez les prix par rang ou catégorie de gagnant.",
      required: true
    },
    {
      key: "critereevaluation",
      title: "Critères d'évaluation",
      icon: <BarChart3 size={16} className="text-slate-400" />,
      placeholder: "Ex: Viabilité économique du projet (30%)",
      description: "Précisez les indicateurs clés de performance (KPI).",
      required: false
    },
    {
      key: "publiccible",
      title: "Profils recherchés",
      icon: <Users2 size={16} className="text-slate-400" />,
      placeholder: "Ex: Étudiants, Startups ou Entreprises",
      description: "Définissez l'audience cible autorisée à postuler.",
      required: false
    },
  ];

  const isInternal = data.site === "talent innovant";
  const inputStyle = "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all placeholder:text-slate-400";
  const errorInputStyle = "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500";
  const cardStyle = "bg-white border border-slate-200 rounded-md p-6 shadow-sm transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Détails structurels & Clauses
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Finalisez les modalités précises pour informer vos futurs participants.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.key} className={`${cardStyle} ${errors[section.key] ? 'border-red-200 ring-1 ring-red-100' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  {section.title} {section.required && <span className="text-orange-700 ml-1">*</span>}
                </h3>
              </div>
              {errors[section.key] && (
                <span className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <AlertCircle size={12} /> Obligatoire
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-4 border-b border-slate-50 pb-2">
              {section.description}
            </p>

            <div className="space-y-3">
              {(Array.isArray(data[section.key]) ? data[section.key] : [""]).map((item: string, index: number) => (
                <div key={index} className="flex gap-2 items-center group">
                  <div className="flex-1">
                    <input
                      className={`${inputStyle} ${errors[section.key] && !item.trim() ? errorInputStyle : ""}`}
                      placeholder={section.placeholder}
                      value={item}
                      onChange={(e) => updateArrayItem(section.key, index, e.target.value)}
                    />
                  </div>
                  {(data[section.key] || [""]).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(section.key, index)}
                      className="p-2 text-slate-300 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem(section.key)}
              className="mt-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-orange-700 hover:text-orange-800 transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
              Ajouter une clause
            </button>
          </div>
        ))}
      </div>

      {/* INFO BOX */}
      <div className="bg-slate-900 rounded-md p-5 text-white shadow-lg border-l-4 border-orange-700">
        <div className="flex gap-4 items-center">
          <AlertCircle className="text-orange-500 shrink-0" size={20} />
          <div className="text-[11px] font-bold uppercase tracking-wider leading-relaxed">
            <span className="text-orange-500 mr-2">[INFO SYSTÈME]</span>
            {isInternal
              ? "L'étape suivante permettra la configuration dynamique du formulaire de réponse participant."
              : "La validation entraînera la publication immédiate du challenge sur le réseau Talent Innovant."}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors disabled:opacity-30"
          disabled={isSubmitting}
        >
          Précédent
        </button>
        
       {forCreate &&  <button
          type="button"
          onClick={handleNext}
          className={`min-w-[200px] flex items-center justify-center gap-3 px-8 py-2.5 rounded-md text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
            isInternal ? "bg-slate-900 hover:bg-slate-800" : "bg-orange-700 hover:bg-orange-800"
          } text-white disabled:opacity-50`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              Finalisation en cours...
            </>
          ) : isInternal ? (
            <>Configurer le formulaire <span className="text-orange-500">→</span></>
          ) : (
            <>Publier le challenge <span className="text-orange-400 font-normal">🚀</span></>
          )}
        </button>}
      </div>
    </div>
  );
}