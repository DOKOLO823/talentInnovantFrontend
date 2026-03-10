import React from "react";
import {
  X,
  Globe,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const ChallengeTypeModal = ({ isOpen, onClose, solde }: any) => {
  if (!isOpen) return null;

  const PRIX_INTERNE = 50000;
  const whatsappNumber = "+237655624168";
  const whatsappMsg = encodeURIComponent(
    "Je suis une entreprise inscrite sur Talent Innovant, je viens pour recharger mon solde.",
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Organiser une compétition
            </h3>
            <p className="text-sm text-slate-500 text-pretty">
              Choisissez le format adapté à vos objectifs d'innovation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Section Solde */}
        <div className="p-6 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <Wallet className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Votre Solde Entreprise
              </p>
              <p className="text-2xl font-black text-slate-800">
                {solde?.toLocaleString()}{" "}
                <span className="text-sm font-medium">FCFA</span>
              </p>
            </div>
          </div>

          {solde < PRIX_INTERNE && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-green-200"
            >
              <MessageCircle size={18} /> Rechargez votre solde
            </a>
          )}
        </div>

        {/* Grille des choix */}
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Challenge Interne */}
          <div className="p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                Challenge Interne
              </h4>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed italic">
              "Propulsez votre innovation au sein de Talent Innovant. Profitez
              de notre puissance technologique et de notre communauté."
            </p>
            <ul className="space-y-3">
              {[
                "Communication ciblée vers notre vaste communauté",
                "Soumission et sélection de projets fluidifiées",
                "Évaluation simplifiée via nos outils experts",
                "Publication des résultats automatisée",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={16}
                    className="text-green-500 mt-0.5 shrink-0"
                  />{" "}
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-start justify-center mt-auto pt-4 border-t border-slate-100">
              <div className="flex flex-row items-center justify-center gap-x-2 mb-2 px-2">
                <span>Prix : </span>
                <span className="text-xl font-bold text-slate-800">
                  50 000 FCFA
                </span>
              </div>
              {solde >= PRIX_INTERNE ? (
                <Link
                  href="/challenge/create?lieu=interne"
                  className="flex items-center gap-2 bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-orange-800 transition-all"
                >
                  Organiser <ArrowRight size={18} />
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-slate-200 text-slate-500 px-6 py-2.5 rounded-lg font-bold cursor-not-allowed"
                >
                  Solde insuffisant
                </button>
              )}
            </div>
          </div>

          {/* Challenge Externe */}
          <div className="p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Globe size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800">
                Challenge Externe
              </h4>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed italic">
              "Utilisez Talent Innovant comme simple vitrine pour rediriger les
              talents vers votre propre plateforme."
            </p>
            <ul className="space-y-3">
              {[
                "Visibilité accrue sur notre portail",
                "Lien direct vers votre site d'organisation",
                "Référencement dans le catalogue",
                "Tous vos abonnés informés instantanément de votre compétition",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={16}
                    className="text-blue-500 mt-0.5 shrink-0"
                  />{" "}
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-start justify-center mt-auto pt-4 border-t border-slate-100">
              <div className="flex items-center px-2 mb-2 gap-x-2">
                <span>Prix : </span>
                <span className="text-xl font-bold text-slate-800 uppercase">
                  0 FCFA (Gratuit)
                </span>
              </div>
              <Link
                href="/challenge/create?lieu=externe"
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition-all"
              >
                Publier <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeTypeModal;
