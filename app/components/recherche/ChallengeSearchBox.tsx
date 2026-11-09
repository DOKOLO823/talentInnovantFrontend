"use client";

// Emplacement : app/components/recherche/ChallengeSearchBox.tsx
// Zone de recherche partagée (accueil talent, accueil guest, page de résultats).
// Fonctionne connecté ou non : ne dépend d'aucune authentification.

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import { useFiltreOptions } from "@/app/hooks/useFiltreOptions";

const RESULTS_PATH = "/challenge/search";

const shorten = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

export default function ChallengeSearchBox({
  initialQ = "",
  initialDomaine = "",
  initialVille = "",
  className = "",
}: {
  initialQ?: string;
  initialDomaine?: string;
  initialVille?: string;
  className?: string;
}) {
  const router = useRouter();
  const { options, loading, reload } = useFiltreOptions();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [domaine, setDomaine] = useState(initialDomaine);
  const [ville, setVille] = useState(initialVille);

  // Resynchronise les champs quand l'URL change (nouvelle recherche sur la page de résultats)
  useEffect(() => {
    setQ(initialQ);
    setDomaine(initialDomaine);
    setVille(initialVille);
  }, [initialQ, initialDomaine, initialVille]);

  // Précharge la page de résultats : le clic devient quasi instantané
  useEffect(() => {
    router.prefetch(RESULTS_PATH);
  }, [router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (domaine) params.set("domaine", domaine);
    if (ville) params.set("lieu", ville);
    const qs = params.toString();

    // isPending passe à true immédiatement : le bouton réagit au clic
    startTransition(() => {
      router.push(qs ? `${RESULTS_PATH}?${qs}` : RESULTS_PATH);
    });
  };

  const selectClass =
    "w-full pl-9 pr-8 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none text-sm font-medium truncate";

  return (
    <form
      onSubmit={submit}
      className={`bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-3 md:flex-row md:items-stretch ${className}`}
    >
      {/* Mot-clé */}
      <div className="relative md:flex-[2]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          enterKeyHint="search"
          placeholder="Rechercher par titre ou description"
          className="w-full pl-10 pr-3 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium"
        />
      </div>

      {/* Domaine + Ville : sur la même ligne */}
      <div className="grid grid-cols-2 gap-3 md:flex-[2]">
        <div className="relative min-w-0">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={domaine}
            onChange={(e) => setDomaine(e.target.value)}
            onFocus={() => !options && reload()}
            aria-label="Domaine"
            className={selectClass}
          >
            <option value="">
              {loading ? "Chargement..." : "Tous les domaines"}
            </option>
            {options?.domaines.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.description
                  ? `${d.nom} — ${shorten(d.description, 45)}`
                  : d.nom}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative min-w-0">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            onFocus={() => !options && reload()}
            aria-label="Ville"
            className={selectClass}
          >
            <option value="">
              {loading ? "Chargement..." : "Toutes les villes"}
            </option>
            {options?.lieux
              .filter((l) => l !== "Partout")
              .map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bouton */}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-8 py-3 bg-orange-700 text-white font-bold rounded-xl hover:bg-orange-800 active:scale-95 transition-all shadow-lg shadow-orange-700/20 disabled:opacity-80 w-full md:w-auto"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        {isPending ? "Recherche..." : "Rechercher"}
      </button>
    </form>
  );
}
