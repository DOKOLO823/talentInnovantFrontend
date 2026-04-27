// app/communaute/components/TalentChallengeTypeModal.tsx

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Trophy, Globe, ChevronRight, Info } from "lucide-react";

export default function TalentChallengeTypeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleOrganiser = () => {
    router.push("/challenge/create?lieu=interne&typechallenge=talent");
    onClose();
  };

  const handlePublier = () => {
    router.push("/challenge/create?lieu=externe&typechallenge=talent");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full sm:max-w-lg sm:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
      >
        {/* Drag handle visible uniquement sur mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 border-b bg-slate-50/50 rounded-t-[2rem] sm:rounded-t-[2.5rem] shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Que souhaitez-vous faire ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-snug">
              Choisissez comment partager votre challenge avec la communauté
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content — scrollable si trop petit */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-4 sm:px-8 py-4 sm:py-6 space-y-4">
          {/* Option 1 : Organiser */}
          <button
            onClick={handleOrganiser}
            className="w-full group flex items-start gap-4 p-4 sm:p-6 border-2 border-slate-200 hover:border-orange-400 active:border-orange-400 bg-white hover:bg-orange-50/30 active:bg-orange-50/30 rounded-2xl sm:rounded-3xl transition-all text-left"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
              <Trophy size={24} className="text-orange-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                  Organiser un challenge
                </h3>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-orange-700 shrink-0"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                Créez un challenge qui se déroule directement sur Talent
                Innovant. Les participants postulent via la plateforme.
              </p>
              <span className="inline-block mt-2.5 text-[10px] sm:text-[11px] font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                ✓ Gratuit — disponible immédiatement
              </span>
            </div>
          </button>

          {/* Option 2 : Publier externe */}
          <button
            onClick={handlePublier}
            className="w-full group flex items-start gap-4 p-4 sm:p-6 border-2 border-slate-200 hover:border-slate-400 active:border-slate-400 bg-white hover:bg-slate-50 active:bg-slate-50 rounded-2xl sm:rounded-3xl transition-all text-left"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
              <Globe size={24} className="text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                  Publier un challenge externe
                </h3>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-slate-700 shrink-0"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                Vous avez déjà un challenge sur une autre plateforme ?
                Partagez-le ici pour le rendre visible à toute la communauté.
              </p>
              <div className="flex items-start gap-2 mt-2.5 p-2.5 sm:p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Info size={13} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] sm:text-[11px] text-amber-700 leading-relaxed font-semibold">
                  Ce type de challenge sera vérifié par notre équipe avant
                  d'apparaître sur la page d'accueil. Les challenges non
                  crédibles ne seront pas publiés sur la page d'accueil.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 text-center border-t border-slate-100 shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-600">
            Tous les challenges sont gratuits pour les talents
          </p>
        </div>
      </motion.div>
    </div>
  );
}
