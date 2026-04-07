"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Globe,
  ChevronRight,
  Check,
  Wallet,
  AlertCircle,
  Loader2,
  Star,
  ArrowLeft,
  Shield,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";

// ── Types ──
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

export default function ChallengeTypeModal({
  isOpen,
  onClose,
  solde: soldeProp = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  solde?: number;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<"choice" | "packs">("choice");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [solde, setSolde] = useState<number>(soldeProp);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScreen("choice");
      setSelectedPack(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (screen !== "packs") return;
    setLoadingPacks(true);
    apiFetch("/challenge-packs", { method: "GET" })
      .then((res) => {
        if (res?.statut === 200) {
          setPacks(res.packs);
          setSolde(res.solde);
        }
      })
      .finally(() => setLoadingPacks(false));
  }, [screen]);

  const handleOrganiser = () => setScreen("packs");

  const handlePublier = () => {
    router.push("/challenge/create?lieu=externe");
    onClose();
  };

  const handleSelectPack = () => {
    if (!selectedPack) return;
    router.push(`/challenge/create?lieu=interne&pack=${selectedPack}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-500 ease-in-out"
        style={{
          // Élargissement massif ici pour laisser respirer les grandes cartes
          maxWidth: screen === "packs" ? "1400px" : "520px",
          maxHeight: "95vh",
        }}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-8 py-6 border-b bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {screen === "packs" && (
              <button
                onClick={() => setScreen("choice")}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {screen === "choice"
                  ? "Que souhaitez-vous faire ?"
                  : "Choisir votre pack"}
              </h2>
              <p className="text-sm text-slate-500">
                {screen === "choice"
                  ? "Sélectionnez le type de challenge à créer"
                  : "Sélectionnez le pack adapté à vos objectifs"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── CONTENU ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ÉCRAN 1 : CHOIX */}
            {screen === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-6"
              >
                <button
                  onClick={handleOrganiser}
                  className="w-full group flex items-start gap-6 p-6 border-2 border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/30 rounded-3xl transition-all text-left"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
                    <Trophy size={32} className="text-orange-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-lg">
                        Organiser un challenge
                      </h3>
                      <ChevronRight
                        size={20}
                        className="text-slate-400 group-hover:text-orange-700"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Créez un challenge hébergé directement sur Talent Innovant
                      avec formulaire, évaluation et résultats.
                    </p>
                  </div>
                </button>

                <button
                  onClick={handlePublier}
                  className="w-full group flex items-start gap-6 p-6 border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-3xl transition-all text-left"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                    <Globe size={32} className="text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-lg">
                        Publier un challenge externe
                      </h3>
                      <ChevronRight
                        size={20}
                        className="text-slate-400 group-hover:text-slate-700"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Référencez un challenge qui se déroule sur une autre
                      plateforme avec un lien de participation.
                    </p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* ÉCRAN 2 : PACKS */}
            {screen === "packs" && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 md:p-12 bg-slate-50/50"
              >
                {/* Solde Header */}
                <div className="flex items-center gap-4 mb-10 px-8 py-5 bg-white border border-slate-200 rounded-[2rem] w-fit shadow-md">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <Wallet size={24} className="text-orange-700" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                      Solde disponible
                    </p>
                    <p className="text-xl font-black text-slate-900 leading-none">
                      {solde.toLocaleString("fr-FR")}{" "}
                      <span className="text-orange-700">FCFA</span>
                    </p>
                  </div>
                </div>

                {loadingPacks ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2
                      className="animate-spin text-orange-700"
                      size={48}
                    />
                    <p className="text-base text-slate-500 font-medium italic">
                      Synchronisation des offres...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {packs.map((pack) => {
                      const isSelected = selectedPack === pack.id;
                      const isPremium = pack.id === "premium";
                      const isRecommended = pack.id === "avance";
                      const Icon =
                        {
                          starter: Zap,
                          standard: Globe,
                          avance: Star,
                          premium: Shield,
                        }[pack.id] || Zap;

                      return (
                        <div
                          key={pack.id}
                          onClick={() =>
                            pack.disponible && setSelectedPack(pack.id)
                          }
                          className={`relative flex flex-col rounded-[2.5rem] border-2 transition-all duration-300 p-8 select-none min-h-[550px]
                            ${isPremium ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-100"}
                            ${pack.disponible ? "cursor-pointer hover:shadow-2xl hover:-translate-y-2" : "opacity-60 cursor-not-allowed"}
                            ${isSelected ? `ring-4 ring-orange-700/20 border-orange-700 shadow-xl scale-[1.03]` : "shadow-sm"}
                          `}
                        >
                          {(isRecommended || isPremium) && (
                            <div
                              className={`absolute -top-4 left-8 flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg
                              ${isPremium ? "bg-amber-500 text-white" : "bg-orange-700 text-white"}`}
                            >
                              {isPremium ? (
                                <Shield size={14} fill="white" />
                              ) : (
                                <Star size={14} fill="white" />
                              )}
                              {isPremium
                                ? "Offre Exclusive"
                                : "Le plus populaire"}
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-8">
                            <div
                              className={`p-5 rounded-2xl ${isPremium ? "bg-white/10" : "bg-slate-50 border border-slate-100"}`}
                            >
                              <Icon
                                size={32}
                                className={
                                  isPremium
                                    ? "text-amber-400"
                                    : "text-orange-700"
                                }
                              />
                            </div>
                            {isSelected && (
                              <div className="bg-orange-700 p-2 rounded-full shadow-lg">
                                <Check
                                  size={20}
                                  className="text-white"
                                  strokeWidth={4}
                                />
                              </div>
                            )}
                          </div>

                          <h3
                            className={`font-black text-xl uppercase tracking-wider mb-2 ${isPremium ? "text-white" : "text-slate-900"}`}
                          >
                            {pack.nom}
                          </h3>

                          <div className="mb-8 flex items-baseline gap-2">
                            <span
                              className={`text-4xl font-black ${isPremium ? "text-white" : "text-slate-900"}`}
                            >
                              {pack.prix.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-sm font-bold text-slate-400 uppercase">
                              FCFA
                            </span>
                          </div>

                          <div
                            className={`h-px w-full mb-8 ${isPremium ? "bg-white/10" : "bg-slate-100"}`}
                          />

                          <ul className="space-y-4 flex-1 mb-10">
                            {pack.avantages.map((av, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm font-medium leading-tight"
                              >
                                <Check
                                  size={20}
                                  className={`${isPremium ? "text-amber-500" : "text-orange-700"} shrink-0 mt-0.5`}
                                />
                                <span
                                  className={
                                    isPremium
                                      ? "text-slate-300"
                                      : "text-slate-600"
                                  }
                                >
                                  {av}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-auto pt-6">
                            <p
                              className={`text-xs italic leading-relaxed mb-6 opacity-60 ${isPremium ? "text-slate-200" : "text-black"}`}
                            >
                              {pack.accroche}
                            </p>
                            {!pack.disponible ? (
                              <div className="flex items-center justify-center gap-3 text-red-500 bg-red-500/10 px-4 py-4 rounded-2xl border border-red-500/20">
                                <AlertCircle size={20} />
                                <span className="text-xs font-black uppercase">
                                  Manque :{" "}
                                  {pack.solde_manquant.toLocaleString("fr-FR")}{" "}
                                  FCFA
                                </span>
                              </div>
                            ) : (
                              <div
                                className={`w-full py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border-2 transition-all
                                ${isSelected ? "bg-orange-700 border-transparent text-white" : isPremium ? "border-white/20 text-white" : "border-slate-200 text-slate-500"}`}
                              >
                                {isSelected
                                  ? "Plan sélectionné"
                                  : "Choisir ce forfait"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER FIXE ── */}
        {screen === "packs" && (
          <div className="px-4 md:px-10 py-4 md:py-6 border-t bg-white flex items-center justify-between gap-x-4 md:gap-x-0 flex-shrink-0">
            <button
              onClick={() => setScreen("choice")}
              className="text-xs md:text-base font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Retour au choix
            </button>
            <button
              onClick={handleSelectPack}
              disabled={!selectedPack}
              className="flex items-center gap-3 px-2 md:px-10 py-2 md:py-4 bg-orange-700 hover:bg-orange-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-2xl transition-all shadow-xl text-xs md:text-base"
            >
              Continuer avec ce pack
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
