"use client";

import { useState } from "react";
import { Upload, Link2 } from "lucide-react";
import BackButton from "@/app/components/BackButton";

export default function CreateOpportunityClient({ domaines }: any) {
  const [form, setForm] = useState<any>({
    titre: "",
    description: "",
    type: "Emploi",
    domaine_id: "",
    linkType: "url", // url | file
    lien: null,
  });

  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <BackButton />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="mb-8 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Créer une opportunité
          </h1>
          <p className="text-gray-500 mt-1">
            Publiez une offre d’emploi, de stage ou une opportunité professionnelle
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 border">

          {/* TITRE */}
          <div className="mb-6">
            <label className="label">Titre de l’opportunité</label>
            <input
              className="input"
              placeholder="Développeur Frontend React"
              onChange={(e) => update("titre", e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">
            <label className="label">Description</label>
            <textarea
              rows={4}
              className="textarea"
              placeholder="Décrivez brièvement l’opportunité..."
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* TYPE + DOMAINE */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="label">Type</label>
              <select
                className="select"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option>Emploi</option>
                <option>Stage</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label className="label">Domaine</label>
              <select
                className="select"
                onChange={(e) => update("domaine_id", e.target.value)}
              >
                <option value="">Sélectionner un domaine</option>
                {domaines.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIEN OU FICHIER */}
          <div className="mb-6">
            <label className="label">Détails de l’offre</label>

            {/* SWITCH */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => update("linkType", "url")}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  form.linkType === "url"
                    ? "bg-orange-700 text-white border-orange-700"
                    : "bg-white text-gray-600"
                }`}
              >
                <Link2 size={14} className="inline mr-1" />
                Lien web
              </button>

              <button
                type="button"
                onClick={() => update("linkType", "file")}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  form.linkType === "file"
                    ? "bg-orange-700 text-white border-orange-700"
                    : "bg-white text-gray-600"
                }`}
              >
                <Upload size={14} className="inline mr-1" />
                Fichier
              </button>
            </div>

            {/* INPUT URL */}
            {form.linkType === "url" && (
              <input
                className="input"
                placeholder="https://entreprise.com/offre"
                onChange={(e) => update("lien", e.target.value)}
              />
            )}

            {/* INPUT FILE */}
            {form.linkType === "file" && (
              <label className="upload-zone mt-2">
                <Upload className="w-6 h-6 text-orange-600" />
                <span className="text-sm text-gray-600">
                  Télécharger un document (PDF, Word…)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={(e) => update("lien", e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {/* ACTION */}
          <div className="flex justify-end pt-6">
            <button
              className="btn-primary"
              onClick={() => {
                console.log("OPPORTUNITÉ:", form);
              }}
            >
              Publier l’opportunité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
