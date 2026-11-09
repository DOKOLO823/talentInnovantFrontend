"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronsDown, Loader2, RotateCcw, Search } from "lucide-react";
import ChallengeCard from "@/app/components/ChallengeCard";
import BackButton from "@/app/components/BackButton";
import BackToTop from "@/app/components/BackToTop";
import Navbar from "@/app/components/Navbar";
import ChallengeSearchBox from "@/app/components/recherche/ChallengeSearchBox";
import { ChallengeSkeletonCards } from "@/app/components/ChallengeSkeleton";
import { apiFetch } from "@/app/lib/api";
import { mapChallengeToCard } from "@/app/lib/mapChallengeCard";

const STATUTS = [
  { value: "tous", label: "Tous les challenges" },
  { value: "en_cours", label: "En cours" },
  { value: "avenir", label: "À venir" },
  { value: "termines", label: "Terminés" },
];

export default function SearchClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const domaine = searchParams.get("domaine") || "";
  const lieu = searchParams.get("lieu") || "";

  // Le statut se remet à "Tous" à chaque nouvelle recherche (sans double chargement)
  const searchKey = `${q}|${domaine}|${lieu}`;
  const [statutState, setStatutState] = useState({
    key: searchKey,
    value: "tous",
  });
  const statut = statutState.key === searchKey ? statutState.value : "tous";

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [domaineNom, setDomaineNom] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (page: number) => {
      const id = ++requestId.current;
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(false);

      try {
        const params = new URLSearchParams({ page: String(page), statut });
        if (q) params.set("q", q);
        if (domaine) params.set("domaine", domaine);
        if (lieu) params.set("lieu", lieu);

        const res = await apiFetch(
          `/challenges/recherche?${params.toString()}`,
          {
            method: "GET",
          },
        );

        if (id !== requestId.current) return; // réponse périmée : on l'ignore

        if (res?.statut === 200) {
          const mapped = (res.data || []).map(mapChallengeToCard);
          setResults((prev) => {
            if (page === 1) return mapped;
            const ids = new Set(prev.map((c) => c.id));
            return [...prev, ...mapped.filter((c: any) => !ids.has(c.id))];
          });
          setTotal(res.total ?? 0);
          setHasMore(!!res.has_more);
          setDomaineNom(res.domaine_nom || "");
          pageRef.current = page;
        } else {
          setError(true);
        }
      } catch (e) {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [q, domaine, lieu, statut],
  );

  // Nouvelle recherche ou nouveau statut : on repart de la page 1 (skeletons)
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const hasCriteria = q || domaine || lieu;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <BackButton m={16} />

      {/* Nouvelle recherche, sur la même page */}
      <section className="max-w-6xl mx-auto px-4 mt-4">
        <ChallengeSearchBox
          initialQ={q}
          initialDomaine={domaine}
          initialVille={lieu}
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Résumé + tri par statut */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="min-w-0">
            <p className="text-xl font-bold text-gray-900">
              {loading
                ? "Recherche en cours..."
                : `${total} résultat${total > 1 ? "s" : ""}`}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {q && (
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  Mot-clé : « {q} »
                </span>
              )}
              {domaine && (
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  Domaine : {domaineNom || "sélectionné"}
                </span>
              )}
              {lieu && (
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                  Ville : {lieu}
                </span>
              )}
              {!hasCriteria && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  Tous les domaines · Toutes les villes
                </span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
            <span className="font-medium">Afficher :</span>
            <select
              value={statut}
              onChange={(e) =>
                setStatutState({ key: searchKey, value: e.target.value })
              }
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            <ChallengeSkeletonCards count={8} />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500 mb-4">
              Impossible de charger les résultats.
            </p>
            <button
              onClick={() => fetchPage(1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 active:scale-95 transition-all"
            >
              <RotateCcw size={18} /> Réessayer
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-xl border border-dashed">
            <Search className="mx-auto text-gray-300 mb-3" size={40} />
            Aucun résultat trouvé.
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
              {results.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>

            <div className="flex flex-col items-center mt-10">
              {hasMore ? (
                <button
                  onClick={() => fetchPage(pageRef.current + 1)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-orange-700 border border-orange-700 rounded-xl font-bold hover:bg-orange-700 hover:text-white active:scale-95 transition-all disabled:opacity-70"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Chargement...
                    </>
                  ) : (
                    <>
                      <ChevronsDown className="h-5 w-5" /> Charger plus de
                      challenges
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Vous avez vu tous les résultats.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <BackToTop />
    </div>
  );
}
