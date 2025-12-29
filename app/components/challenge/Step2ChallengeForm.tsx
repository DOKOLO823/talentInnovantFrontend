"use client";

import { useState } from "react";
import DynamicFieldBuilder from "./DynamicFieldBuilder";
import FormPreviewModal from "@/app/components/modals/FormPreviewModal";

export default function Step2ChallengeForm({
  fields,
  setFields,
  onBack,
  onSubmit,
}: any) {
  const [openPreview, setOpenPreview] = useState(false);

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Formulaire de participation
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Définissez les informations que les participants devront fournir pour
          soumettre leur projet.
        </p>
      </div>

      {/* BUILDER */}
      <div className="card">
        <DynamicFieldBuilder fields={fields} setFields={setFields} />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
        >
          ← Retour
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpenPreview(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Aperçu du formulaire
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary"
          >
            Publier le challenge
          </button>
        </div>
      </div>

      {/* MODAL APERÇU */}
      <FormPreviewModal
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        fields={fields}
      />
    </div>
  );
}
