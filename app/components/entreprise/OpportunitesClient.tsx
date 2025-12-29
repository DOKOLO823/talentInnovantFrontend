"use client";

import { useState, useMemo } from "react";
import { ArrowUp, Search } from "lucide-react";
import Link from "next/link";
import { OpportuniteCard } from "../opportunite/OpportuniteCard";
import { motion, MotionConfig } from "framer-motion";

export default function OpportunitesClient({ opportunites }: any) {
  const tabs = ["Emploi", "Stage", "Autre"];
  const [active, setActive] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const [domaine, setDomaine] = useState("Tous");
   const [showBackToTop, setShowBackToTop] = useState(false);


  const domaines = ["Tous", ...Array.from(new Set(opportunites.map((o: any) => o.domaine)))];

  const filtered = useMemo(() =>
    opportunites.filter((o: any) => {
      const matchType = o.type.toLowerCase() === active.toLowerCase();
      const matchDomaine = domaine === "Tous" || o.domaine === domaine;
      const matchSearch = o.titre.toLowerCase().includes(query.toLowerCase());
      return matchType && matchDomaine && matchSearch;
    }), [opportunites, active, domaine, query]
  );

   const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", 
    });
  };

  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Offres d'opportunités</h2>
          <p className="text-gray-500">Publiez et gérez vos offres</p>
        </div>

        <Link
          href="/opportunite/create"
          className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800 transition"
        >
          Publier une opportunité
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-3">Vos offres d'opportunités</h3>

        {/* TABS */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-2 rounded whitespace-nowrap ${
                active === t
                  ? "bg-orange-50 text-orange-700 border border-orange-700"
                  : "text-gray-600 border border-gray-300"
              }`}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* SELECT + SEARCH */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
          <select
            value={domaine}
            onChange={(e) => setDomaine(e.target.value)}
            className="border p-2 rounded w-full md:w-48"
          >
            {domaines.map((d: any) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              className="pl-10 p-2 border rounded w-full"
              placeholder="Rechercher une opportunité..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* GRID RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length ? (
            filtered.map((o: any) => (
              <OpportuniteCard key={o.id} opp={o} />
            ))
          ) : (
            <p className="text-gray-500">Aucune opportunité trouvée.</p>
          )}
        </div>
      </div>
    </div>
  );
}
