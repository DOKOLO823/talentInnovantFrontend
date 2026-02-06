"use client";

import FormTemplateCard from "./FormTemplateCard";
import { FORM_TEMPLATES } from "./templates";

interface Step2FormSelectorProps {
  onEmpty: () => void;
  onTemplate: (fields: any[]) => void;
  onBack: () => void;
}

export default function Step2FormSelector({ onEmpty, onTemplate, onBack }: Step2FormSelectorProps) {
  return (
    <div className="space-y-10 animate-fadeIn">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Formulaire de participation
        </h2>
        <p className="text-gray-500 mt-2">
          Choisissez comment créer le formulaire pour vos participants
        </p>
      </div>

      {/* Option : Créer à partir de zéro */}
      <button
        onClick={onEmpty}
        className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 
        hover:border-orange-600 hover:bg-orange-50/30 transition-all group"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition">
            <svg
              className="w-7 h-7 text-orange-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition">
              Personnaliser un formulaire à partir de zéro
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Créez chaque champ selon vos besoins spécifiques
            </p>
          </div>
        </div>
      </button>

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-gray-500 font-medium">
            ou choisissez un modèle
          </span>
        </div>
      </div>

      {/* Modèles prédéfinis */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Modèles de formulaires
        </h3>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORM_TEMPLATES.map((template) => (
            <FormTemplateCard
              key={template.id}
              template={template}
              onUse={() => onTemplate(template.fields)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-start pt-6 border-t">
        <button type="button" onClick={onBack} className="btn-outline">
          ← Retour aux informations
        </button>
      </div>
    </div>
  );
}