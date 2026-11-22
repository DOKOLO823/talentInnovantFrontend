"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";

import domaines from "@/domaines.json";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import BackButton from "../components/BackButton";
import BackToTop from "../components/BackToTop";
import { TalentPropositionCard } from "./components/TalentPropositionCard";
import { TalentSkeletonCards } from "../components/TalentSkeleton";
import { apiFetch } from "@/app/lib/api";
import {
  getCachedPropositions,
  loadPropositions,
  markRequestSent,
  type Propositions,
} from "../lib/propositionsCache";

// Taille d'un lot de la liste initiale (doit être identique à $perPage côté backend)
const PAGE_SIZE = 16;
// Même endpoint que celui utilisé par propositionsCache
const PROPOSITIONS_ENDPOINT = "/reseau/propositions";
// Endpoint de recherche (lots de 20)
const SEARCH_ENDPOINT = "/reseau/recherche";

const EMPTY_FILTERS = {
  domaine: "",
  region: "",
  ville: "",
  searchBy: "nom",
  query: "",
};

// Construit l'URL de recherche (seuls les critères renseignés sont envoyés)
const buildSearchUrl = (f: typeof EMPTY_FILTERS, pageNumber: number) => {
  const params = new URLSearchParams();
  if (f.query.trim()) {
    params.set("query", f.query.trim());
    params.set("searchBy", f.searchBy);
  }
  if (f.domaine) params.set("domaine", f.domaine);
  if (f.region) params.set("region", f.region);
  if (f.ville) params.set("ville", f.ville);
  params.set("page", String(pageNumber));
  return `${SEARCH_ENDPOINT}?${params.toString()}`;
};

// Ajoute des talents à une liste sans doublons
const mergeUnique = (prev: any[], incoming: any[]) => {
  const ids = new Set(prev.map((t) => t.id));
  return [...prev, ...incoming.filter((t) => !ids.has(t.id))];
};

const CAMEROON_GEO: any = {
  Adamaoua: ["Ngaoundéré", "Tignère", "Meiganga", "Banyo", "Tibati"],
  Centre: ["Yaoundé", "Obala", "Mfou", "Mbalmayo", "Akonolinga", "Eseka"],
  Est: ["Bertoua", "Batouri", "Garoua-Boulaï", "Abong-Mbang"],
  "Extrême-Nord": ["Maroua", "Kousseri", "Mokolo", "Mora", "Yagoua"],
  Littoral: ["Douala", "Nkongsamba", "Edea", "Manjo", "Loum"],
  Nord: ["Garoua", "Guider", "Poli", "Figuil"],
  "Nord-Ouest": ["Bamenda", "Kumbo", "Ndop", "Wum"],
  Ouest: ["Bafoussam", "Dschang", "Foumban", "Bangangté", "Mbouda", "Baham"],
  Sud: ["Ebolowa", "Kribi", "Ambam", "Sangmelima"],
  "Sud-Ouest": ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko"],
};

const SEARCH_BY = [
  { value: "nom", label: "Nom" },
  { value: "profession", label: "Profession" },
  { value: "competence", label: "Compétence" },
];

const selectClass =
  "w-full pl-3 pr-9 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none disabled:opacity-50 truncate transition";

export default function SearchCollaborators() {
  // Critères en cours de saisie (n'agissent qu'au clic sur "Rechercher")
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [allTalents, setAllTalents] = useState<any[]>([]);
  const [userRelations, setUserRelations] = useState({
    envoyees: [] as number[],
    recues: [] as number[],
    actives: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  // Pagination "Charger plus" de la liste initiale
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Mode recherche
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS); // critères réellement recherchés
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRequestId = useRef(0);

  const applyData = (d: Propositions) => {
    setUserRelations({
      envoyees: d.envoyees,
      recues: d.recues,
      actives: d.actives,
    });
    setAllTalents(d.talents);
    setPage(1);
    // Si le premier lot est complet, il y a probablement une suite
    setHasMore(d.talents.length >= PAGE_SIZE);
  };

  // Affichage immédiat depuis la mémoire, puis mise à jour en arrière-plan
  useEffect(() => {
    let cancelled = false;

    const cached = getCachedPropositions();
    if (cached) {
      applyData(cached);
      setLoading(false);
    }

    loadPropositions().then((fresh) => {
      if (cancelled) return;
      if (fresh) applyData(fresh);
      else if (!cached) toast.error("Erreur de chargement");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Lance une recherche (les champs vides sont ignorés côté serveur)
  const handleSearch = async () => {
    if (searching) return;

    const requestId = ++searchRequestId.current;
    setSearching(true);

    try {
      const res = await apiFetch(buildSearchUrl(filters, 1), {
        method: "GET",
      });
      if (requestId !== searchRequestId.current) return; // recherche annulée entre-temps

      if (res?.statut === 200) {
        setAppliedFilters(filters);
        setSearchResults(res.data?.talents ?? []);
        setSearchTotal(res.data?.total ?? 0);
        setSearchPage(1);
        setSearchHasMore(!!res.data?.a_plus);
        setIsSearchMode(true);
      } else {
        toast.error("Impossible de lancer la recherche");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      if (requestId === searchRequestId.current) setSearching(false);
    }
  };

  // Charger le lot suivant (recherche ou liste initiale) et l'ajouter à la suite
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      if (isSearchMode) {
        const nextPage = searchPage + 1;
        const res = await apiFetch(buildSearchUrl(appliedFilters, nextPage), {
          method: "GET",
        });
        if (res?.statut === 200) {
          setSearchResults((prev) =>
            mergeUnique(prev, res.data?.talents ?? []),
          );
          setSearchPage(nextPage);
          setSearchHasMore(!!res.data?.a_plus);
        } else {
          toast.error("Impossible de charger la suite");
        }
      } else {
        const nextPage = page + 1;
        const res = await apiFetch(
          `${PROPOSITIONS_ENDPOINT}?page=${nextPage}`,
          { method: "GET" },
        );
        if (res?.statut === 200) {
          setAllTalents((prev) => mergeUnique(prev, res.data?.talents ?? []));
          setPage(nextPage);
          setHasMore(!!res.data?.a_plus);
        } else {
          toast.error("Impossible de charger la suite");
        }
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoadingMore(false);
    }
  };

  const hasDraftCriteria = !!(
    filters.query.trim() ||
    filters.domaine ||
    filters.region ||
    filters.ville
  );

  // Affichés selon les critères réellement recherchés
  const activeFiltersLabel = useMemo(() => {
    const parts: string[] = [];
    if (appliedFilters.query.trim())
      parts.push(`« ${appliedFilters.query.trim()} »`);
    if (appliedFilters.domaine) {
      const d = domaines.find((dom: any) => dom.id == appliedFilters.domaine);
      if (d) parts.push(d.nom);
    }
    if (appliedFilters.region) parts.push(appliedFilters.region);
    if (appliedFilters.ville) parts.push(appliedFilters.ville);
    return parts;
  }, [appliedFilters]);

  const displayedTalents = isSearchMode ? searchResults : allTalents;
  const activeHasMore = isSearchMode ? searchHasMore : hasMore;

  const addSentRequest = (talentId: number) => {
    markRequestSent(talentId);
    setUserRelations((prev) => ({
      ...prev,
      envoyees: [...prev.envoyees, talentId],
    }));
  };

  // Retour à l'état initial : la liste de départ est restée en mémoire
  const resetFilters = () => {
    searchRequestId.current++; // invalide une recherche en cours
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
    setSearchHasMore(false);
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Toaster position="top-center" />

      <header className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto pt-6 pb-2">
        <div className="ml-3">
          <BackButton />
        </div>

        <div className="mt-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trouver un collaborateur
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Découvrez des talents dont les compétences complètent votre projet.
          </p>
        </div>
      </header>

      <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Zone de recherche et de filtres */}
        <section className="mt-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder={`Rechercher par ${filters.searchBy}...`}
                className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 transition"
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl w-full lg:w-auto">
              {SEARCH_BY.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setFilters({ ...filters, searchBy: type.value })
                  }
                  className={`flex-1 lg:flex-none px-3 md:px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filters.searchBy === type.value
                      ? "bg-white text-orange-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile : domaine seul, région + ville sur la même ligne, bouton en dernier */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative col-span-2 md:col-span-1">
              <select
                className={selectClass}
                value={filters.domaine}
                onChange={(e) =>
                  setFilters({ ...filters, domaine: e.target.value })
                }
              >
                <option value="">Tous les domaines</option>
                {domaines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nom}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                className={selectClass}
                value={filters.region}
                onChange={(e) =>
                  setFilters({ ...filters, region: e.target.value, ville: "" })
                }
              >
                <option value="">Région</option>
                {Object.keys(CAMEROON_GEO).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                className={selectClass}
                value={filters.ville}
                disabled={!filters.region}
                onChange={(e) =>
                  setFilters({ ...filters, ville: e.target.value })
                }
              >
                <option value="">Ville</option>
                {filters.region &&
                  CAMEROON_GEO[filters.region].map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-orange-700 text-white rounded-xl text-sm font-bold hover:bg-orange-800 transition-all active:scale-95 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {searching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
              {searching ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </section>

        {/* Résumé des résultats + filtres actifs */}
        <div className="mt-5 mb-4 flex flex-wrap items-center gap-2">
          {isSearchMode && !searching && (
            <p className="text-sm font-semibold text-slate-700 mr-1">
              {searchTotal} talent{searchTotal > 1 ? "s" : ""} trouvé
              {searchTotal > 1 ? "s" : ""}
            </p>
          )}

          {activeFiltersLabel.map((label, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold"
            >
              <SlidersHorizontal size={11} /> {label}
            </span>
          ))}

          {(isSearchMode || hasDraftCriteria) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-300 text-slate-500 hover:text-red-500 hover:border-red-300 text-xs font-semibold transition-colors"
            >
              <X size={12} /> Effacer
            </button>
          )}
        </div>

        <div>
          {loading || searching ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              <TalentSkeletonCards count={8} />
            </div>
          ) : displayedTalents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {displayedTalents.map((talent) => (
                <TalentPropositionCard
                  key={talent.id}
                  talent={talent}
                  relations={userRelations}
                  onSuccess={addSentRequest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center px-4">
              <div className="text-slate-300 mb-2">
                <Search size={48} />
              </div>
              <p className="text-slate-400 font-medium mb-6">
                Aucun talent trouvé pour ces critères.
              </p>

              {isSearchMode ? (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-2xl font-bold hover:bg-orange-800 transition-all active:scale-95 shadow-lg shadow-orange-700/20"
                >
                  <RotateCcw size={18} />
                  Réinitialiser la recherche
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-2xl font-bold hover:bg-orange-800 transition-all active:scale-95 shadow-lg shadow-orange-700/20"
                >
                  <RotateCcw size={18} />
                  Actualiser la page
                </button>
              )}
            </div>
          )}

          {/* Bouton "Charger plus" */}
          {!loading && !searching && activeHasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl text-sm font-bold hover:border-orange-500 hover:text-orange-700 transition-all active:scale-95 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <Loader2 size={18} className="animate-spin text-orange-700" />
                ) : (
                  <ChevronDown size={18} />
                )}
                {loadingMore ? "Chargement..." : "Charger plus"}
              </button>
            </div>
          )}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
