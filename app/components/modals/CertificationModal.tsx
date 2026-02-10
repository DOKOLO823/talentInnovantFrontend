"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Globe,
  Facebook,
  Mail,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

export default function CertificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    website: "",
    facebook: "",
    email_contact: "",
  });

  // Scroll automatique vers l'erreur
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const handleSubmit = async () => {
    setError(null);

    // Validation : Au moins un champ rempli
    if (!formData.website && !formData.facebook && !formData.email_contact) {
      setError(
        "Veuillez renseigner au moins un canal de contact (Site, Facebook ou Email) pour l'examen.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/entreprise/demander-certification", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.statut === 200) {
        toast.success(
          "Demande envoyée avec succès ! Notre équipe reviendra vers vous.",
          { duration: 6000 },
        );
        onClose();
      } else {
        setError(res.message || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <h2 className="font-black uppercase text-xs md:text-lg text-slate-900 tracking-tighter">
              Demande de certification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div ref={formRef} className="p-8 overflow-y-auto space-y-6">
          {/* Zone d'erreur */}
          {error && (
            <motion.div
              ref={errorRef}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          <p className="text-slate-500 text-sm leading-relaxed">
            Pour valider votre entreprise, veuillez nous fournir les liens
            officiels permettant d'identifier votre activité.
          </p>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Site Web Officiel
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="https://votre-site.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-700 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Page Facebook
              </label>
              <div className="relative">
                <Facebook
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="url"
                  placeholder="facebook.com/votrepage"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-700 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm"
                  value={formData.facebook}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Email de Contact
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="contact@entreprise.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-700 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm"
                  value={formData.email_contact}
                  onChange={(e) =>
                    setFormData({ ...formData, email_contact: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-slate-200 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 text-xs"
          >
            {loading ? (
              <Loader2 className="animate-spin text-orange-700" size={20} />
            ) : (
              "Soumettre ma demande"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
