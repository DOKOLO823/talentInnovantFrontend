"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Briefcase, LayoutGrid, Loader2, AlertCircle } from "lucide-react";
import { OpportuniteCard } from "../opportunite/OpportuniteCard";
import { motion, AnimatePresence } from "framer-motion";
import CreateOpportunityModal from "./CreateOpportunityModal";
import { apiFetch } from "@/app/lib/api";
import { toast, Toaster } from "react-hot-toast";

// Importation de votre JSON local (uniquement pour l'ajout)
import domainesJSON from "@/domaines.json";
import { useRouter } from "next/navigation";

export default function OpportunitesClient() {
  const [opportunites, setOpportunites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const tabs = ["Emploi", "Stage", "Autre"];
  const [active, setActive] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const [domaine, setDomaine] = useState("Tous les domaines");
  const router = useRouter();

  useEffect(() => {

     const userStr = localStorage.getItem("auth");
    if(!userStr){
          router.push("/auth/login");
          return;
        }

    const fetchOpps = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/mes-opportunites", { method: "GET" });
        const data = res.data || res; 
        setOpportunites(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Erreur auth:", err);
        setError(true);
        if (err.message === "Unauthenticated.") {
          toast.error("Votre session a expiré.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  // EXTRACTION DYNAMIQUE DES DOMAINES EXISTANTS
  const filterDomaines = useMemo(() => {
    // On récupère uniquement les noms des domaines présents dans les opportunités chargées
    const names = opportunites
      .map((o: any) => o.domaine?.nom || o.domaine) // Gère objet ou string
      .filter(Boolean);
    
    // Set permet de supprimer les doublons
    return ["Tous les domaines", ...Array.from(new Set(names))];
  }, [opportunites]);

  const filtered = useMemo(() =>
    opportunites.filter((o: any) => {
      const matchType = o.type?.toLowerCase() === active.toLowerCase();
      const currentDom = o.domaine?.nom || o.domaine;
      const matchDomaine = domaine === "Tous les domaines" || currentDom === domaine;
      const matchSearch = o.titre?.toLowerCase().includes(query.toLowerCase());
      return matchType && matchDomaine && matchSearch;
    }), [opportunites, active, domaine, query]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 md:p-8 rounded-[1rem] mt-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <Toaster/>
        <div className="flex items-center gap-4">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Opportunités</h2>
            <p className="text-gray-500 font-medium">Gérez vos publications en temps réel</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-8 py-2 rounded-2xl font-bold transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} /> Publier une offre
        </button>
      </div>

      {/* FILTRES & LISTE */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[450px]">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  active === t ? "bg-white text-orange-700 shadow-sm" : "text-gray-500"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={domaine}
              onChange={(e) => setDomaine(e.target.value)}
              className="bg-gray-50 border-none p-3.5 rounded-xl text-sm font-bold outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500"
            >
              {filterDomaines.map((d: any) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="pl-12 p-3.5 bg-gray-50 border-none rounded-xl text-sm w-full sm:w-64 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500"
                placeholder="Rechercher une offre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold animate-pulse">Synchronisation...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-red-500">
            <AlertCircle size={48} className="mb-4" />
            <p className="font-bold">Impossible de charger les données.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.length ? (
                filtered.map((o: any) => (
                 
                    <OpportuniteCard key={o.id || `opp-${Math.random()}`} opp={o} />
                  
                ))
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} className="w-full py-20 text-center">
                  <LayoutGrid className="mx-auto text-gray-200 mb-4" size={64} />
                  <p className="text-gray-400 font-bold text-lg">Aucun résultat</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateOpportunityModal 
            onClose={() => setIsModalOpen(false)}
            domaines={domainesJSON}
            onSuccess={(newOpp: any) => {
              setOpportunites((prev) => [newOpp, ...prev]);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}