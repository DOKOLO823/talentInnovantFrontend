"use client";

import FormTemplateCard from "./FormTemplateCard";
import { FORM_TEMPLATES } from "./templates";

export default function Step2FormSelector({ onEmpty, onTemplate, onBack }: any) {
  return (
    <div className="space-y-10">

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Formulaire de participation
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Choisissez comment créer le formulaire pour les participants
        </p>
      </div>

      {/* Bouton zéro */}
      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-orange-600 transition">
        <button
          onClick={onEmpty}
          className="text-orange-700 font-semibold"
        >
          + Personnaliser un formulaire à partir de zéro
        </button>
      </div>

      {/* Modèles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FORM_TEMPLATES.map(t => (
          <FormTemplateCard
            key={t.id}
            template={t}
            onUse={() => onTemplate(t.fields)}
          />
        ))}
        

          {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
        >
          ← Retour
        </button>
        </div>

      </div>
    </div>
  );
}
