"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Milestone,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface StepPlanningProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPlanning({
  data,
  onChange,
  onNext,
  onBack,
}: StepPlanningProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: any) => {
    if (errors[key])
      setErrors((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    onChange({ ...data, [key]: value });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();

    if (!data.datelancement) {
      newErrors.datelancement = "La date de lancement est obligatoire.";
    }
    //  else if (new Date(data.datelancement) < now) {
    //   newErrors.datelancement =
    //     "La date de lancement ne peut pas être dans le passé.";
    // }

    if (!data.datefininscription) {
      newErrors.datefininscription =
        "La date de fin des inscriptions est obligatoire.";
    }
    // else if (
    //   data.datelancement &&
    //   new Date(data.datefininscription) <= new Date(data.datelancement)
    // ) {
    //   newErrors.datefininscription =
    //     "La fin des inscriptions doit être après le lancement.";
    // }

    if (!data.datefin) {
      newErrors.datefin = "La date de fin du challenge est obligatoire.";
    }
    // else if (
    //   data.datefininscription &&
    //   new Date(data.datefin) <= new Date(data.datefininscription)
    // ) {
    //   newErrors.datefin =
    //     "La fin du challenge doit être après la clôture des inscriptions.";
    // }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) onNext();
  };

  const labelStyle =
    "block text-[12px] font-bold uppercase tracking-tight text-slate-900 mb-1.5";
  const inputStyle =
    "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all";
  const errorInput =
    "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200";
  const cardStyle =
    "bg-white border border-slate-200 rounded-md p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";
  const errStyle =
    "flex items-center gap-1 text-red-600 text-[10px] font-bold mt-1";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fields = [
    { id: "datelancement", label: "Ouverture", desc: "Début des dépôts" },
    {
      id: "datefininscription",
      label: "Clôture Inscriptions",
      desc: "Limite de participation",
    },
    { id: "datefin", label: "Fin du Challenge", desc: "Arrêt des rendus" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar size={20} className="text-slate-400" />
          Calendrier de l'événement
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Définissez les échéances clés pour structurer la participation.
        </p>
      </div>

      <div className="bg-slate-900 rounded-md p-5 text-white shadow-lg border-l-4 border-orange-700">
        <div className="flex gap-4">
          <div className="bg-orange-700/20 p-2 rounded h-fit">
            <Lightbulb className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[11px] uppercase tracking-[0.1em] mb-2 text-orange-500">
              Directives de planification
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-[11px] text-slate-400 leading-relaxed uppercase font-medium">
              <p>
                <span className="text-white block mb-0.5 font-bold">
                  Inscriptions
                </span>{" "}
                7 à 10 jours minimum recommandés.
              </p>
              <p>
                <span className="text-white block mb-0.5 font-bold">
                  Production
                </span>{" "}
                À adapter selon la complexité.
              </p>
              <p>
                <span className="text-white block mb-0.5 font-bold">Flux</span>{" "}
                Les dates doivent être séquentielles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={cardStyle}>
        <div className="grid md:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className={labelStyle}>
                {field.label} <span className="text-orange-700">*</span>
              </label>
              <input
                type="datetime-local"
                className={`${inputStyle} ${errors[field.id] ? errorInput : ""}`}
                value={data[field.id] || ""}
                onChange={(e) => update(field.id, e.target.value)}
              />
              {errors[field.id] ? (
                <p className={errStyle}>
                  <AlertCircle size={10} />
                  {errors[field.id]}
                </p>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <Clock size={10} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {field.desc}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {(data.datelancement || data.datefininscription || data.datefin) && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-6">
          <div className="flex items-center gap-2 mb-8">
            <Milestone size={14} className="text-slate-400" />
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">
              Chronologie prévisionnelle
            </h3>
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 px-4">
            <div className="hidden md:block absolute top-[19px] left-0 w-full h-[1px] bg-slate-300 -z-0" />
            {[
              {
                key: "datelancement",
                label: "Lancement",
                color: "bg-orange-700",
              },
              {
                key: "datefininscription",
                label: "Clôture Inscriptions",
                color: "bg-slate-900",
              },
              {
                key: "datefin",
                label: "Clôture Finale",
                color: "bg-slate-900",
              },
            ].map((step) => (
              <div
                key={step.key}
                className="flex md:flex-col items-center gap-4 md:gap-3 bg-slate-50 relative z-10 md:px-4"
              >
                <div
                  className={`w-[38px] h-[38px] rounded-full ${step.color} flex items-center justify-center border-4 border-slate-50 shadow-sm`}
                >
                  <CheckCircle2 className="text-white" size={16} />
                </div>
                <div className="text-left md:text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {step.label}
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {data[step.key]
                      ? formatDate(data[step.key])
                      : "-- / -- / --"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-orange-700 text-white px-8 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all shadow-sm flex items-center gap-3"
        >
          Valider le planning <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
