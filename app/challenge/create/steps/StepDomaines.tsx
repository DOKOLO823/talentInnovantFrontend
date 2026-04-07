"use client";

import { useState } from "react";
import { Check, LayoutGrid, Target, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface StepDomainesProps {
  data: any;
  onChange: (data: any) => void;
  domaines: Array<{ id: number; nom: string; description: string }>;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDomaines({
  data,
  onChange,
  domaines,
  onNext,
  onBack,
}: StepDomainesProps) {
  const [error, setError] = useState("");

  const update = (key: string, value: any) => {
    if (error) setError("");
    onChange({ ...data, [key]: value });
  };

  const toggleDomaine = (domaineId: number) => {
    const current = data.domaines || [];
    const isSelected = current.includes(domaineId);
    update(
      "domaines",
      isSelected
        ? current.filter((id: number) => id !== domaineId)
        : [...current, domaineId],
    );
  };

  const handleNext = () => {
    if (!data.domaines || data.domaines.length === 0) {
      const msg = "Veuillez sélectionner au moins un domaine.";
      setError(msg);
      toast.error(msg);
      return;
    }
    onNext();
  };

  const cardStyle =
    "bg-white border border-slate-200 rounded-md p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LayoutGrid size={20} className="text-slate-400" />
          Domaines de compétence
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ciblez les expertises requises pour ce challenge.
        </p>
      </div>

      <div className="bg-slate-900 rounded-md p-5 text-white shadow-lg border-l-4 border-orange-700">
        <div className="flex gap-4">
          <div className="bg-orange-700/20 p-2 rounded h-fit">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold text-[11px] uppercase tracking-[0.1em] mb-1 text-orange-500">
              Ciblage Algorithmique
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-medium">
              Les domaines sélectionnés déterminent quels talents seront
              notifiés. Un ciblage précis augmente le taux de participation de{" "}
              <span className="text-white font-bold">40%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Grille */}
      <div
        className={`${cardStyle} ${error ? "border-red-200 ring-1 ring-red-100" : ""}`}
      >
        {error && (
          <div className="flex items-center gap-2 mb-4 text-red-600 text-xs font-bold">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {domaines.map((domaine) => {
            const isSelected = (data.domaines || []).includes(domaine.id);
            return (
              <button
                key={domaine.id}
                type="button"
                onClick={() => toggleDomaine(domaine.id)}
                className={`relative text-left p-4 rounded-md border transition-all duration-200 group
                  ${
                    isSelected
                      ? "border-orange-700 bg-orange-50/50 ring-1 ring-orange-700"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`font-bold text-[13px] leading-tight pr-6 ${isSelected ? "text-orange-900" : "text-slate-900"}`}
                  >
                    {domaine.nom}
                  </h3>
                  {isSelected && (
                    <div className="bg-orange-700 rounded-full p-0.5 shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p
                  className={`text-[11px] leading-relaxed line-clamp-2 font-medium ${isSelected ? "text-orange-800/70" : "text-slate-500"}`}
                >
                  {domaine.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            ← Précédent
          </button>
          {data.domaines?.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-orange-700 animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                {data.domaines.length} Sélectionné
                {data.domaines.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto bg-orange-700 text-white px-10 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all shadow-sm active:scale-[0.98]"
        >
          Finaliser le challenge →
        </button>
      </div>
    </div>
  );
}
