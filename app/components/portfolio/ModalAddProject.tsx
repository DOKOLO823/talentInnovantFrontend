"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ModalAddProject({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    technologie: "",
    year: "",
    link: "",
  });

  const [mediasFiles, setMediasFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Preview files avant upload
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediasFiles(files);

    const previewURLs = files.map((f) => URL.createObjectURL(f));
    setPreviews(previewURLs);
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      medias: previews, // Seulement aperçu local
      technologie: form.technologie.split(",").map((t) => t.trim()),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg mx-4 my-8">
        <div className="bg-white rounded-xl shadow-xl border relative">

          {/* === HEADER STICKY === */}
          <div className="sticky top-0 bg-white z-20 px-5 py-4 border-b rounded-t-xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Ajouter un projet</h2>
              <p className="text-sm text-gray-500">Remplis les informations du nouveau projet</p>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-gray-600 hover:text-gray-900 rounded-full p-2"
            >
              <X />
            </button>
          </div>

          {/* === CONTENT SCROLLABLE === */}
          <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">

              {/* Titre */}
              <div>
                <label className="text-sm font-medium block mb-1">Titre du projet</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium block mb-1">Description du projet</label>
                <textarea
                  className="w-full border p-3 rounded h-36 resize-vertical"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Présente ton projet : objectif, fonctionnalités, résultats obtenus.
                </p>
              </div>

              {/* Technologies */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Technologies utilisées <span className="text-xs text-gray-400">(séparées par virgules)</span>
                </label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.technologie}
                  onChange={(e) => setForm({ ...form, technologie: e.target.value })}
                />
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium block mb-1">Images du projet</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full"
                  onChange={handleMediaChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ajoute une ou plusieurs images de ton projet. Elles ne seront enregistrées que localement pour le moment.
                </p>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {previews.map((p, i) => (
                      <div
                        key={i}
                        className="w-full h-24 rounded bg-gray-100 overflow-hidden flex items-center justify-center"
                      >
                        <img src={p} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Année + Lien */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Année de réalisation</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Lien vers le projet</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-orange-700 text-white py-2 rounded-lg hover:bg-orange-800 transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
          {/* End scrollable content */}
        </div>
      </div>
    </div>
  );
}
