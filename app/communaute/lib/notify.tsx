"use client";

// Toasts globaux de la Communauté : un seul système (react-hot-toast), des messages issus du serveur.

import Link from "next/link";
import toast, { type Toast } from "react-hot-toast";
import type { ReactElement, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

export const LOGIN_PATH = "/auth/login"; // adapter si votre route de connexion est différente

/** Message d'erreur à afficher : celui du serveur si disponible, sinon le texte de secours */
export function apiErrorMessage(e: any, fallback: string): string {
  if (e instanceof TypeError)
    return "Erreur de connexion. Vérifiez votre réseau.";
  const m = typeof e?.message === "string" ? e.message : "";
  if (/unauthenticated/i.test(m))
    return "Connectez-vous pour effectuer cette action.";
  if (/too many/i.test(m))
    return "Trop de tentatives. Réessayez dans un instant.";
  return m || fallback;
}

function Shell({
  t,
  icon,
  children,
  onClose,
}: {
  t: Toast;
  icon: ReactNode;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role="status"
      style={{ opacity: t.visible ? 1 : 0, transition: "opacity .2s" }}
      className="pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 shadow-xl"
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/** Invitation à se connecter (actions réservées aux membres) */
export function promptLogin(
  message = "Connectez-vous pour effectuer cette action.",
) {
  toast.custom(
    (t) => (
      <Shell
        t={t}
        icon={<AlertCircle size={20} className="text-orange-700" />}
        onClose={() => toast.dismiss(t.id)}
      >
        <p>{message}</p>
        <Link
          href={LOGIN_PATH}
          className="mt-1 inline-block font-semibold text-orange-700 hover:underline"
        >
          Se connecter
        </Link>
      </Shell>
    ),
    { id: "login-required", duration: 6000 },
  );
}

/**
 * Toast de progression (publication / modification) : reste affiché pendant tout l'envoi,
 * puis devient un message de succès ou d'erreur qui reste jusqu'à fermeture manuelle.
 * Le succès n'est affiché QUE sur appel de success() (réponse positive du serveur).
 */
export function startProgressToast(kind: "publish" | "edit") {
  const id = `${kind}-${Date.now()}`;
  const close = () => toast.dismiss(id);
  const show = (render: (t: Toast) => ReactElement) =>
    toast.custom(render, { id, duration: Infinity });
  const titre =
    kind === "publish" ? "Publication du projet" : "Modification du projet";
  let last: number | null | undefined;

  const loading = (pct: number | null) =>
    show((t) => (
      <Shell
        t={t}
        icon={<Loader2 size={20} className="animate-spin text-orange-700" />}
      >
        <p className="font-semibold">
          {pct === null
            ? "Préparation de l'envoi…"
            : pct >= 100
              ? "Finalisation…"
              : `${titre}… ${pct} %`}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-orange-600 transition-all"
            style={{ width: `${pct ?? 5}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Vous pouvez continuer à naviguer.
        </p>
      </Shell>
    ));

  loading(null);

  return {
    update(pct: number | null) {
      if (pct === last) return;
      last = pct;
      loading(pct);
    },
    success(postId?: number) {
      show((t) => (
        <Shell
          t={t}
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          onClose={close}
        >
          {kind === "publish" && postId ? (
            <p>
              Votre post a été publié avec succès.{" "}
              <Link
                href={`/communaute/projets/${postId}`}
                className="font-semibold text-orange-700 hover:underline"
              >
                Voir le post
              </Link>
            </p>
          ) : (
            <p>Votre publication a été modifiée avec succès.</p>
          )}
        </Shell>
      ));
    },
    error(message: string, onRetry?: () => void) {
      show((t) => (
        <Shell
          t={t}
          icon={<AlertCircle size={20} className="text-red-600" />}
          onClose={close}
        >
          <p className="font-semibold">
            {kind === "publish"
              ? "La publication n'a pas abouti."
              : "La modification n'a pas abouti."}
          </p>
          <p className="mt-0.5 text-slate-600">{message}</p>
          {onRetry && (
            <button
              onClick={() => {
                close();
                onRetry();
              }}
              className="mt-1.5 font-semibold text-orange-700 hover:underline"
            >
              Réessayer
            </button>
          )}
        </Shell>
      ));
    },
  };
}
