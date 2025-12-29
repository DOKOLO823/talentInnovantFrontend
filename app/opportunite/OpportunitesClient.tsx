"use client";

import { useState, useMemo } from "react";
import { OpportuniteCard } from "@/app/components/opportunite/OpportuniteCard";
import { Search } from "lucide-react";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import BackButton from "../components/BackButton";
import BackToTop from "../components/BackToTop";

export default function OpportunitesClient({ opportunites }: any) {
  const tabs = ["Emploi", "Stage", "Autre"];
  const [activeTab, setActiveTab] = useState("Emploi");
  const [domaine, setDomaine] = useState("Tous les domaines");
  const [search, setSearch] = useState("");

  // Récupération dynamique des domaines
  const domainesList = ["Tous les domaines", ...new Set(opportunites.map((o: any) => o.domaine))];

  // Filtrage dynamique
  const filteredOpps = useMemo(() => {
    return opportunites.filter((o: any) => {
      const matchTab = o.type.toLowerCase() === activeTab.toLowerCase();
      const matchDomain = domaine === "Tous les domaines" || o.domaine === domaine;
      const matchSearch = o.titre.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchDomain && matchSearch;
    });
  }, [activeTab, domaine, search]);

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 pb-24">
        <Navbar/>
         <BackButton m={4} />
      {/* TITLE */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Offres d'opportunités</h1>

      {/* TABS */}
      <div className="flex gap-6 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium transition ${
              activeTab === tab
                ? "text-orange-700 border-b-2 border-orange-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* TEXTE SOUS TAB */}
      <p className="mt-4 text-gray-700">
        {activeTab === "Emploi" &&
          `Liste des offres d'emploi en ${domaine === "Tous les domaines" ? "tous domaines" : domaine}`}
        {activeTab === "Stage" &&
          `Liste des offres de stage en ${domaine === "Tous les domaines" ? "tous domaines" : domaine}`}
        {activeTab === "Autre" &&
          `Liste des autres opportunités en ${domaine === "Tous les domaines" ? "tous domaines" : domaine}`}
      </p>

      {/* SELECT DOMAINE */}
      <div className="mt-4">
        <select
          className="border rounded-lg p-2 w-full max-w-xs"
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
        >
          {domainesList.map((d:any) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* SEARCH BAR */}
      <div className="mt-4 relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher une opportunité…"
          className="pl-10 border rounded-lg p-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LISTE DES OPPORTUNITÉS */}
      <div className="mt-8 flex flex-row w-full flex-wrap gap-4">
        {filteredOpps.length > 0 ? (
          filteredOpps.map((opp: any) => (
            <OpportuniteCard key={opp.id} opp={opp} />
          ))
        ) : (
          <p className="text-gray-500 mt-6">Aucune opportunité trouvée.</p>
        )}
      </div>
      <BackToTop/>
      <BottomBar/>
    </div>
  );
}
