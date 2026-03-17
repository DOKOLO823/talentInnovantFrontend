"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  Save,
  FileText,
  Globe,
  Loader2,
  Image as ImageIcon,
  Type,
  LayoutGrid,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { toast } from "react-hot-toast";

export default function AnnonceModal({ annonce, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  // Ordre strict Backend (Point 3)
  const CATEGORIES = [
    { id: 1, nom: "Communiqué", desc: "Information officielle" },
    { id: 2, nom: "Événement", desc: "Rencontre, webinar ou conférence" },
    { id: 3, nom: "Appel à projet", desc: "Opportunités et partenariats" },
  ];

  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    lien: "",
    categorieannonce_id: "",
    statut: "Publié",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (annonce) {
      setFormData({
        titre: annonce.titre || "",
        contenu: annonce.contenu || "",
        lien: annonce.lien || "",
        categorieannonce_id:
          annonce.categorieannonce_id || annonce.categorie?.id || "",
        statut: annonce.statut || "Publié",
      });
    }
  }, [annonce]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titre || !formData.categorieannonce_id) {
      return toast.error("Veuillez remplir les champs obligatoires");
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (imageFile) data.append("image", imageFile);
    if (pdfFile) data.append("pdf", pdfFile);

    try {
      const endpoint = annonce ? `/annonces/${annonce.id}/update` : "/annonces";

      // On attend la réponse
      const response = await apiFetch(endpoint, { method: "POST", body: data });

      // ICI : On vérifie le champ "statut" envoyé par votre contrôleur Laravel
      if (response.statut === 200) {
        toast.success(
          response.message ||
            (annonce ? "Annonce mise à jour" : "Annonce publiée !"),
        );
        onSuccess();
      } else {
        // Si le statut est 422, 403, 500, etc.
        toast.error(response.message || "Une erreur est survenue");
      }
    } catch (err: any) {
      // Pour les erreurs réseau ou crash serveur (HTTP 500 réel)
      toast.error("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[95vh] rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl">
              <Type size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {annonce ? "Éditer l'annonce" : "Nouvelle publication"}
              </h2>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                Configuration de l'annonce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all bg-slate-50/50"
                placeholder="Lancement du challenge..."
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.categorieannonce_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categorieannonce_id: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-600 transition-all appearance-none cursor-pointer font-medium text-slate-700"
                    >
                      <option value="">
                        Sélectionner un type d'annonce...
                      </option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id} className="py-2">
                          {cat.nom} — ({cat.desc})
                        </option>
                      ))}
                    </select>
                    <LayoutGrid
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
                <LayoutGrid
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.contenu}
              onChange={(e) =>
                setFormData({ ...formData, contenu: e.target.value })
              }
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-600 bg-slate-50/50"
              placeholder="Décrivez votre annonce..."
            />
          </div>

          {/* Uploads - Mentions Optionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 text-pretty">
                Image de couverture{" "}
                <span className="text-slate-400 font-medium text-xs">
                  (Optionnel)
                </span>
              </label>
              <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 hover:bg-orange-50/50 cursor-pointer transition-all">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                  <ImageIcon size={20} />
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {imageFile ? imageFile.name : "Format JPG, PNG"}
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Document PDF{" "}
                <span className="text-slate-400 font-medium text-xs">
                  (Optionnel)
                </span>
              </label>
              <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 hover:bg-red-50/30 cursor-pointer transition-all">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                  <FileText size={20} />
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {pdfFile ? pdfFile.name : "Format PDF uniquement"}
                </span>
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe size={16} /> Lien externe{" "}
              <span className="text-slate-400 font-medium text-xs">
                (Optionnel)
              </span>
            </label>
            <input
              type="url"
              value={formData.lien}
              onChange={(e) =>
                setFormData({ ...formData, lien: e.target.value })
              }
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-600 bg-slate-50/50"
              placeholder="https://..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
            >
              Annuler
            </button>
            <button
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-700 text-white text-xs md:text-base px-3 md:px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {annonce ? "Enregistrer les modifications" : "Publier maintenant"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
