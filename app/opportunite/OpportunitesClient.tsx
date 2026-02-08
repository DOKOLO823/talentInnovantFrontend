"use client";

import { useState, useMemo, useEffect } from "react";
import { OpportuniteCard } from "@/app/components/opportunite/OpportuniteCard";
import { Search, Loader2 } from "lucide-react";
import BackButton from "../components/BackButton";
import BackToTop from "../components/BackToTop";
import { apiFetch } from "@/app/lib/api";

// --- FONCTIONS DE GESTION DES DATES (Identiques aux notifications) ---
const getGroupTitle = (dateString: string): string => {
  if (!dateString) return "Anciennes opportunités";

  const date = new Date(
    dateString.includes("Z") || dateString.includes("+")
      ? dateString
      : `${dateString.replace(" ", "T")}Z`,
  );
  const now = new Date();

  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0 && date.getDate() === now.getDate())
    return "Aujourd'hui";
  if (diffInDays <= 1 && date.getDate() !== now.getDate()) return "Hier";
  if (diffInDays < 7) return "Cette semaine";

  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

export default function OpportunitesClient() {
  const [opportunites, setOpportunites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();

  // --- ÉTATS POUR LES FILTRES ---
  const tabs = ["Emploi", "Stage", "Autre"];
  const [activeTab, setActiveTab] = useState("Emploi");
  const [domaine, setDomaine] = useState("Tous les domaines");
  const [search, setSearch] = useState("");

  // --- LOGIQUE POUR NAVBAR DYNAMIQUE (FIXE AU SCROLL) ---
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && currentScrollY > 50) {
        setIsScrollingUp(true);
      } else {
        setIsScrollingUp(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const userStr = localStorage.getItem("auth");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }

    const loadData = async () => {
      try {
        const res = await apiFetch("/opportunites", { method: "GET" });
        if (res?.statut === 200) setOpportunites(res.data);
        await apiFetch("/opportunites/reset", { method: "GET" });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- FILTRAGE ET GROUPEMENT ---
  const domainesList = useMemo(() => {
    return [
      "Tous les domaines",
      ...new Set(opportunites.map((o: any) => o.domaine?.nom).filter(Boolean)),
    ];
  }, [opportunites]);

  // 1. Filtrer les opportunités d'abord
  const filteredOpps = useMemo(() => {
    return opportunites.filter((o: any) => {
      const matchTab = o?.type?.toLowerCase() === activeTab?.toLowerCase();
      const matchDomain =
        domaine === "Tous les domaines" || o.domaine?.nom === domaine;
      const matchSearch =
        o?.titre?.toLowerCase().includes(search?.toLowerCase()) ||
        o?.description?.toLowerCase().includes(search?.toLowerCase());
      return matchTab && matchDomain && matchSearch;
    });
  }, [activeTab, domaine, search, opportunites]);

  // 2. Grouper les opportunités filtrées par période (comme les notifications)
  const groupedOpps = useMemo(() => {
    // ✅ IMPORTANT : On ne fait PLUS de .sort() ici car le backend s'en occupe déjà.
    // On se contente de grouper les éléments filtrés.
    const groups: { [key: string]: any[] } = {};

    filteredOpps.forEach((opp) => {
      const title = getGroupTitle(opp.created_at || opp.date);
      if (!groups[title]) groups[title] = [];
      groups[title].push(opp);
    });

    return groups;
  }, [filteredOpps]);

  return (
    <div className="max-w-6xl mx-auto p-3 pt-24 pb-24">
      <BackButton m={4} />
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
        Offres d'opportunités
      </h1>

      {/* SEUL CE BLOC (TABS) EST STICKY */}
      <div
        className={`sticky z-40 bg-white pt-2 px-4 shadow-sm transition-all duration-300 ease-in-out ${
          isScrollingUp ? "top-[64px]" : "top-0"
        }`}
      >
        <div className="flex gap-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition ${
                activeTab === tab
                  ? "text-orange-700 border-b-2 border-orange-700"
                  : "text-gray-500"
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* RECHERCHE & DOMAINE */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
        <select
          className="border border-gray-300 rounded-lg p-2 w-full max-w-xs outline-none bg-white text-gray-700 focus:border-orange-700 transition-colors shadow-sm"
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
        >
          {domainesList.map((d: any) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou texte..."
            className="pl-10 border border-gray-300 rounded-lg p-2 w-full outline-none bg-white text-gray-700 placeholder:text-gray-400 focus:border-orange-700 transition-colors shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LISTE GROUPÉE OU LOADER */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-orange-700" size={40} />
        </div>
      ) : Object.keys(groupedOpps).length > 0 ? (
        <div className="mt-10 space-y-12">
          {Object.entries(groupedOpps).map(([title, items]) => (
            <div key={title} className="space-y-6">
              {/* Titre de la période avec le style "Notification" */}
              <h2 className="sticky top-10 z-20 py-2 bg-gray-100 text-[15px] font-semibold text-gray-500 first-letter:uppercase tracking-[0.15em] border-l-4 border-orange-700 pl-3">
                {title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((opp: any) => (
                  <OpportuniteCard key={opp.id} opp={opp} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-8">
          <p className="text-gray-500">
            Aucune opportunité trouvée pour vos critères.
          </p>
        </div>
      )}

      <BackToTop />
    </div>
  );
}
