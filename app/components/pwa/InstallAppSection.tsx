"use client";

// Emplacement : app/components/pwa/InstallAppSection.tsx
// Section « Application » pour les pages Paramètres (talent ET entreprise).
// Montre l'état de l'installation et propose la bonne marche à suivre selon l'appareil :
//   - déjà installée          → confirmation
//   - Chrome / Edge / Android → bouton « Installer »
//   - iPhone / iPad           → 3 étapes illustrées
//   - autres cas              → indication via le menu du navigateur

import {
  CheckCircle2,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
} from "lucide-react";
import { usePwa } from "./PwaProvider";

const stepNumber =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-black text-orange-700";

export default function InstallAppSection() {
  const { ready, installed, canInstall, isIos, promptInstall } = usePwa();

  if (!ready) return null;

  const showIosSteps = !installed && !canInstall && isIos;
  const showFallback = !installed && !canInstall && !isIos;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2 px-2">
        <Smartphone size={18} className="text-orange-600" />
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
          Application
        </h2>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <div
              className={`rounded-2xl p-3 transition-colors ${
                installed
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {installed ? <CheckCircle2 size={14} /> : <Download size={14} />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900">
                {installed
                  ? "Application installée"
                  : "Installer l'application"}
              </h3>
              <p className="max-w-xs text-xs font-medium leading-relaxed text-slate-500">
                {installed
                  ? "Vous utilisez l'application. Retrouvez-la à tout moment depuis votre écran d'accueil."
                  : "Accédez à Talent Innovant en un clic depuis votre écran d'accueil, comme une application mobile."}
              </p>
            </div>
          </div>

          {canInstall && !installed && (
            <button
              onClick={promptInstall}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700 active:scale-95 sm:w-auto"
            >
              <Download size={16} /> Installer
            </button>
          )}
        </div>

        {/* iPhone / iPad : pas de bouton possible, on guide pas à pas */}
        {showIosSteps && (
          <ol className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-3">
              <span className={stepNumber}>1</span>
              <span className="min-w-0">
                Touchez le bouton <b>Partager</b>{" "}
                <Share size={14} className="mb-0.5 inline text-orange-600" /> de
                Safari
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className={stepNumber}>2</span>
              <span className="min-w-0">
                Choisissez <b>« Sur l'écran d'accueil »</b>{" "}
                <PlusSquare
                  size={14}
                  className="mb-0.5 inline text-orange-600"
                />
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className={stepNumber}>3</span>
              <span className="min-w-0">
                Touchez <b>Ajouter</b>, puis ouvrez l'application depuis votre
                écran d'accueil
              </span>
            </li>
          </ol>
        )}

        {/* Autres navigateurs : indication générale */}
        {showFallback && (
          <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 text-xs font-medium leading-relaxed text-slate-600">
            <MoreVertical
              size={14}
              className="mt-0.5 shrink-0 text-orange-600"
            />
            <p className="min-w-0">
              Ouvrez le menu de votre navigateur et choisissez{" "}
              <b>« Installer l'application »</b> (ou « Ajouter à l'écran
              d'accueil »). Si elle est déjà installée, ouvrez-la depuis votre
              écran d'accueil ou la liste de vos applications.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
