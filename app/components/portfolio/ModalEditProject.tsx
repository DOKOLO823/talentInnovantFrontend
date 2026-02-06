"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  project: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading:Boolean;
}

export default function ModalEditProject({ project, onClose, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    titre: project.titre || "",
    description: project.description || "",
    technologie: (project.technologie || ""),
    year: project.year || "",
    link: project.link || "",
  });

  const [mediasFiles, setMediasFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(project.medias || []);

  // cleanup object URLs on unmount / previews change
  useEffect(() => {
    return () => {
      mediasFiles.forEach((f) => {
        // no direct URL to revoke here because we created them via URL.createObjectURL in handleMediaChange
      });
    };
  }, [mediasFiles]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediasFiles(files);

    // create previews for local files (no upload yet)
    const previewsURL = files.map((f) => URL.createObjectURL(f));
    setPreviews(previewsURL);
  };

  const handleSubmit = () => {
    // MODIFICATION ICI : On envoie "mediasFiles" (les fichiers) et non "previews"
    onSubmit({
      ...form,
      medias: mediasFiles, // On envoie les vrais objets File
      technologie: form.technologie,
    });

    // Nettoyage des URLs pour la mémoire
    previews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  };

  return (
    // overlay : on autorise le scroll (overflow-auto) pour les écrans petits
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* wrapper pour centrer verticalement avec un peu d'espace en haut */}
      <div className="w-full max-w-lg mx-4 my-8">
        <div className="relative bg-white rounded-xl shadow-xl border">
          {/* HEADER STICKY: reste visible même si le contenu scroll */}
          <div className="sticky top-0 z-20 bg-white border-b px-5 py-4 rounded-t-xl flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Modifier le projet</h2>
              <p className="text-sm text-gray-500">Mets à jour les informations du projet</p>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="ml-4 text-gray-600 hover:text-gray-900 rounded-full p-2"
            >
              <X />
            </button>
          </div>

          {/* CONTENT AREA: zone scrollable avec max-height */}
          <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium block mb-1">Titre du projet</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description du projet</label>
                <textarea
                  className="w-full border p-3 rounded h-36 resize-vertical"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">Décris brièvement ton projet (présentation, objectifs, résultats).</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Technologies utilisées <span className="text-xs text-gray-400">(séparées par des virgules)</span></label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.technologie}
                  onChange={(e) => setForm({ ...form, technologie: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Nouvelles images (aperçu local seulement)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full"
                  onChange={handleMediaChange}
                />
                <p className="text-xs text-gray-400 mt-1">Sélectionne des images depuis ton appareil. Les aperçus restent locaux tant que tu n'as pas connecté l'upload.</p>

                {/* Aperçu responsive : on limite la hauteur d'un côté pour que la grille n'agrandisse pas exagérément */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {previews.map((p, i) => (
                    <div key={i} className="w-full h-24 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      {/* img tag utilisé pour rendre la preview (URL.createObjectURL) */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt={`preview-${i}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Année</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Lien du projet</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-orange-700 text-white py-2 rounded-lg hover:bg-orange-800 transition"
                >
                  {loading ? 'Modification...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
          {/* fin content area */}
        </div>
      </div>
    </div>
  );
}
