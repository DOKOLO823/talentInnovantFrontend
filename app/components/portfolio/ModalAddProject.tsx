"use client";

import { X, Upload, Link2, Loader2, Calendar, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

export default function ModalAddProject({ onClose, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    technologie: "",
    year: '',
    link: "",
  });

  const [mediasFiles, setMediasFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 15 * 1024 * 1024;
    let fileError = "";

    files.forEach((file) => {
      if (file.size > maxSize) fileError = `Le fichier "${file.name}" dépasse 15MB`;
    });

    if (fileError) {
      setErrors((prev) => ({ ...prev, medias: fileError }));
      return;
    }

    setMediasFiles(files);
    setErrors((prev) => ({ ...prev, medias: undefined }));
    const previewURLs = files.map((f) => URL.createObjectURL(f));
    setPreviews(previewURLs);
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    if (!form.titre) {
      setErrors((prev) => ({ ...prev, titre: "Le titre est obligatoire" }));
      return;
    }
    onSubmit({ ...form, medias: mediasFiles });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[95vh] rounded-xl overflow-hidden"
      >
        {/* === HEADER (Sérieux / Gris léger) === */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Ajouter un projet</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Détails et réalisations techniques
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* === CONTENT (Scrollable) === */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Titre du projet <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titre}
              onChange={(e) => handleFieldChange("titre", e.target.value)}
              className={`w-full border ${errors.titre ? 'border-red-500' : 'border-slate-300'} rounded-md px-3 py-2.5 text-sm outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 transition-all shadow-sm`}
              placeholder="ex: Plateforme E-commerce Next.js"
            />
            {errors.titre && <p className="text-red-500 text-[11px] font-medium">{errors.titre}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[13px] font-semibold text-slate-700">Description détaillée</label>
              <span className="text-[11px] text-slate-400">{form.description.length}/5000</span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none min-h-[120px] focus:border-orange-700 transition-all shadow-sm"
              placeholder="Objectifs, défis techniques et solutions apportées..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Technologies */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Technologies utilisées (séparées par des virgules)</label>
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={form.technologie}
                  onChange={(e) => handleFieldChange("technologie", e.target.value)}
                  className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-700 shadow-sm"
                  placeholder="React, Tailwind, Node.js"
                />
              </div>
            </div>

            {/* Année */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Année de réalisation</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => handleFieldChange("year", e.target.value)}
                  className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-700 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Lien */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Lien URL du projet (facultatif)</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={form.link}
                onChange={(e) => handleFieldChange("link", e.target.value)}
                className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-700 shadow-sm"
                placeholder="https://mon-projet.com"
              />
            </div>
          </div>

          {/* Upload Images */}
          <div className="space-y-3 pt-2">
            <label className="text-[13px] font-semibold text-slate-700 block">Médias visuels (images de la réalisation)</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-orange-50/30 hover:border-orange-200 cursor-pointer transition-all">
              <div className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 shadow-sm mb-2">
                <Upload size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-700">Cliquez pour ajouter des captures</p>
              <p className="text-[11px] text-slate-500 mt-1">PNG, JPG ou WebP jusqu'à 15Mo</p>
              <input type="file" hidden multiple accept="image/*" onChange={handleMediaChange} />
            </label>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {previews.map((p, i) => (
                  <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <img src={p} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {/* Logique de suppression */}}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Traitement...
              </>
            ) : (
              "Enregistrer le projet"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}