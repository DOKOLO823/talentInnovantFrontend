"use client";

// Emplacement : app/profil-talent/[id]/TabsPerformances.tsx
// Les performances du talent dont le profil est consulté.
// Le rang, les points et les trophées viennent des données déjà chargées par le profil.
// Les chiffres « Projets soumis » et « Challenges participés » sont demandés à l'API
// (GET /talent/performances/{id}) à l'ouverture de l'onglet : valeurs exactes, indépendantes
// des onglets déjà visités, avec un spinner pendant le chargement.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Medal,
  RefreshCcw,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";

export default function TabsPerformances({
  user,
  isOwner,
}: {
  user: any;
  projects?: any[]; // conservé pour compatibilité avec la page parente (plus utilisé ici)
  isOwner: boolean;
}) {
  const [counts, setCounts] = useState<{
    projets: number;
    challenges: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // incrémenté par « Réessayer »

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false; // évite de mettre à jour l'écran si l'onglet a été quitté

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await apiFetch(`/talent/performances/${user.id}`, {
          method: "GET",
        });
        if (cancelled) return;

        if (res?.statut === 200) {
          setCounts({
            projets: Number(res.projets_soumis) || 0,
            challenges: Number(res.challenges_participes) || 0,
          });
        } else {
          setError(true);
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, reloadKey]);

  // Chargement
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-700" />
        <p className="mt-4 text-sm text-gray-600">
          Chargement des performances...
        </p>
      </div>
    );
  }

  // Échec : on n'affiche pas de chiffres approximatifs
  if (error || !counts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-bold text-gray-900">
          Impossible de charger les performances
        </p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          Vérifiez votre connexion puis réessayez.
        </p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-5 flex items-center gap-2 rounded-full bg-orange-700 px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-700/20 transition-all hover:bg-orange-800 active:scale-95"
        >
          <RefreshCcw size={18} />
          Réessayer
        </button>
      </div>
    );
  }

  const total = Number(user?.total_talent) || 0;
  const rang = user?.rang_general;
  const rangNum = parseInt(String(rang ?? "").replace(/\D/g, ""));

  // Progression : 100 % pour le 1er, proche de 0 % pour le dernier
  const progress =
    !total || !rangNum
      ? 0
      : total <= 1 || rangNum <= 1
        ? 100
        : Math.min(
            99, // Garantit que personne d'autre que le 1er n'atteint 100 %
            Math.max(0, Math.round(((total - rangNum) / (total - 1)) * 100)),
          );

  const stats = [
    { icon: Award, label: "Points", value: user?.points ?? 0 },
    { icon: Medal, label: "Trophées", value: user?.trophies ?? 0 },
    { icon: Target, label: "Challenges participés", value: counts.challenges },
    { icon: TrendingUp, label: "Projets soumis", value: counts.projets },
  ];

  return (
    <div className="space-y-5">
      <h2 className="border-l-4 border-orange-700 pl-3 text-sm text-gray-800 md:text-base">
        {isOwner
          ? "Vos performances sur TALENT INNOVANT :"
          : `Performances de ${user?.name} :`}
      </h2>

      {/* Classement */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-700 to-orange-500 p-6 text-white shadow-lg shadow-orange-700/20">
        <Trophy className="absolute -right-4 -top-4 h-32 w-32 text-white/10" />
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-100">
          Rang sur TALENT INNOVANT
        </p>
        <p className="mt-2 text-4xl font-extrabold leading-none md:text-5xl">
          {rang ?? "—"}
          {total > 0 && (
            <span className="ml-2 text-lg font-semibold text-orange-100 md:text-xl">
              / {total}
            </span>
          )}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-orange-100">
            <span>Progression dans le classement</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.1, ease: "circOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
          >
            <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Icon className="h-5 w-5 text-orange-700" />
            </span>
            <p className="text-2xl font-extrabold text-orange-700 md:text-3xl">
              {value}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <p className="text-sm italic text-slate-500">
        {rangNum === 1
          ? "Au sommet du classement : félicitations !"
          : isOwner
            ? "Continuez de participer aux challenges pour gravir les échelons !"
            : "Les points se gagnent en participant aux challenges."}
      </p>
    </div>
  );
}
