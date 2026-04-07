"use client";

// components/challenge/PackSelector.tsx
// À intégrer dans la page qui présente le choix Organiser / Publier

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  Wallet,
  ChevronRight,
  Star,
} from "lucide-react";

interface Pack {
  id: string;
  nom: string;
  emoji: string;
  prix: number;
  max_regions: number;
  avantages: string[];
  accroche: string;
  disponible: boolean;
  solde_manquant: number;
}

interface PackSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const PACK_COLORS: Record<
  string,
  { bg: string; border: string; badge: string; btn: string }
> = {
  starter: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    btn: "bg-slate-800 hover:bg-slate-700",
  },
  standard: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-700 hover:bg-blue-600",
  },
  avance: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    btn: "bg-orange-700 hover:bg-orange-600",
  },
  premium: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-800",
    btn: "bg-amber-600 hover:bg-amber-500",
  },
};

export default function PackSelector({ isOpen, onClose }: PackSelectorProps) {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [solde, setSolde] = useState(50000);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/challenge-packs", { method: "GET" });
        console.log(res);
        if (res?.statut === 200) {
          setPacks(res.packs);
          setSolde(res.solde);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, [isOpen]);

  const handleSelectPack = () => {
    if (!selected) return;
    router.push(`/challenge/create?lieu=interne&pack=${selected}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Choisir votre pack
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Sélectionnez le pack adapté à vos objectifs de visibilité
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Solde affiché */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Wallet size={16} className="text-orange-700" />
              <span className="text-sm font-bold text-slate-700">
                Solde :{" "}
                <span className="text-orange-700">
                  {solde.toLocaleString("fr-FR")} FCFA
                </span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cards des packs */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-orange-700" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {packs.map((pack) => {
                const colors = PACK_COLORS[pack.id] ?? PACK_COLORS.starter;
                const isSelected = selected === pack.id;
                const isPremium = pack.id === "premium";

                return (
                  <div
                    key={pack.id}
                    onClick={() => pack.disponible && setSelected(pack.id)}
                    className={`relative flex flex-col rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer select-none
                      ${colors.bg} ${colors.border}
                      ${isSelected ? "ring-2 ring-orange-700 ring-offset-2 scale-[1.02]" : ""}
                      ${!pack.disponible ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}
                      ${isPremium ? "border-amber-400" : ""}
                    `}
                  >
                    {isPremium && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                        <Star size={10} fill="white" /> Recommandé
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}

                    {/* Emoji + Nom */}
                    <div className="text-3xl mb-3">{pack.emoji}</div>
                    <h3 className="font-black text-slate-900 text-base">
                      {pack.nom}
                    </h3>

                    {/* Prix */}
                    <div className="mt-2 mb-4">
                      <span className="text-2xl font-black text-slate-900">
                        {pack.prix.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">FCFA</span>
                    </div>

                    {/* Avantages */}
                    <ul className="space-y-1.5 flex-1">
                      {pack.avantages.map((av, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <Check
                            size={12}
                            className="text-orange-700 mt-0.5 shrink-0"
                          />
                          <span>{av}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Accroche */}
                    <p className="text-[10px] text-slate-500 italic mt-3 leading-relaxed">
                      👉 {pack.accroche}
                    </p>

                    {/* Badge solde insuffisant */}
                    {!pack.disponible && (
                      <div className="mt-3 flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                        <AlertCircle size={12} />
                        <span className="text-[10px] font-bold">
                          Manque {pack.solde_manquant.toLocaleString("fr-FR")}{" "}
                          FCFA
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSelectPack}
            disabled={!selected}
            className="flex items-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-md text-sm"
          >
            Continuer avec ce pack
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
