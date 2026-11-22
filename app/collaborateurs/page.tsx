"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import domaines from "@/domaines.json";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import BackButton from "../components/BackButton";
import BackToTop from "../components/BackToTop";
import { TalentPropositionCard } from "./components/TalentPropositionCard";
import { TalentSkeletonCards } from "../components/TalentSkeleton";
import {
  getCachedPropositions,
  loadPropositions,
  markRequestSent,
  type Propositions,
} from "../lib/propositionsCache";

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
  const [filters, setFilters] = useState({
    domaine: "",
    region: "",
    ville: "",
    searchBy: "nom",
    query: "",
  });

  const [allTalents, setAllTalents] = useState<any[]>([]);
  const [userRelations, setUserRelations] = useState({
    envoyees: [] as number[],
    recues: [] as number[],
    actives: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  const applyData = (d: Propositions) => {
    setUserRelations({
      envoyees: d.envoyees,
      recues: d.recues,
      actives: d.actives,
    });
    setAllTalents(d.talents);
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

  // FILTRAGE
  const filteredTalents = useMemo(() => {
    return allTalents.filter((t: any) => {
      const matchDomaine = !filters.domaine || t.domaine_id == filters.domaine;
      const matchRegion =
        !filters.region || t.talent?.region === filters.region;
      const matchVille = !filters.ville || t.talent?.ville === filters.ville;

      const q = filters.query.toLowerCase().trim();
      let matchQuery = true;

      if (q) {
        if (filters.searchBy === "nom") {
          const fullName =
            `${t.talent?.nom || ""} ${t.talent?.prenom || ""}`.toLowerCase();
          const searchTerms = q.split(/\s+/);
          matchQuery = searchTerms.every((term) => fullName.includes(term));
        } else if (filters.searchBy === "profession") {
          matchQuery = t.talent?.profession?.toLowerCase().includes(q);
        } else if (filters.searchBy === "competence") {
          matchQuery = t.talent?.competence?.toLowerCase().includes(q);
        }
      }

      return matchDomaine && matchRegion && matchVille && matchQuery;
    });
  }, [allTalents, filters]);

  const activeFiltersLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.domaine) {
      const d = domaines.find((dom: any) => dom.id == filters.domaine);
      if (d) parts.push(d.nom);
    }
    if (filters.region) parts.push(filters.region);
    if (filters.ville) parts.push(filters.ville);
    return parts;
  }, [filters]);

  const addSentRequest = (talentId: number) => {
    markRequestSent(talentId);
    setUserRelations((prev) => ({
      ...prev,
      envoyees: [...prev.envoyees, talentId],
    }));
  };

  const resetFilters = () =>
    setFilters({
      domaine: "",
      region: "",
      ville: "",
      searchBy: "nom",
      query: "",
    });

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
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
                <option value="">Toutes les régions</option>
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
                <option value="">Toutes les villes</option>
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
          </div>
        </section>

        {/* Résumé des résultats + filtres actifs */}
        <div className="mt-5 mb-4 flex flex-wrap items-center gap-2">
          {/* {!loading && (
            <p className="text-sm font-semibold text-slate-700 mr-1">
              {filteredTalents.length} talent
              {filteredTalents.length > 1 ? "s" : ""}
            </p>
          )} */}

          {activeFiltersLabel.map((label, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold"
            >
              <SlidersHorizontal size={11} /> {label}
            </span>
          ))}

          {(activeFiltersLabel.length > 0 || filters.query) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-300 text-slate-500 hover:text-red-500 hover:border-red-300 text-xs font-semibold transition-colors"
            >
              <X size={12} /> Effacer
            </button>
          )}
        </div>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              <TalentSkeletonCards count={8} />
            </div>
          ) : filteredTalents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {filteredTalents.map((talent) => (
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

              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-2xl font-bold hover:bg-orange-800 transition-all active:scale-95 shadow-lg shadow-orange-700/20"
              >
                <RotateCcw size={18} />
                Actualiser la page
              </button>
            </div>
          )}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
