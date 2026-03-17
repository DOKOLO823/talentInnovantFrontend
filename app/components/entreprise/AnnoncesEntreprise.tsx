"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  Megaphone,
  LayoutGrid,
  Calendar as CalendarIcon,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import AnnonceCard from "./cards/AnnonceCard";
import AnnonceModal from "./modals/AnnonceModal";

export default function AnnoncesEntreprise() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("auth");
      const authData = JSON.parse(userStr || "{}");
      const res = await apiFetch(`/annonces/entreprise/${authData.user.id}`);
      setAnnonces(res.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Erreur de chargement des annonces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const filteredAnnonces = useMemo(() => {
    return annonces.filter((a) => {
      const matchTitle = a.titre.toLowerCase().includes(query.toLowerCase());
      const matchDate = dateFilter
        ? a.created_at?.startsWith(dateFilter)
        : true;
      return matchTitle && matchDate;
    });
  }, [annonces, query, dateFilter]);

  const handleEdit = (annonce: any) => {
    setSelectedAnnonce(annonce);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = (id: number) => {
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white mt-8 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-2xl">
            <Megaphone className="text-orange-600" size={32} />
          </div>
          <div>
            <h2 className="text-base md:text-2xl font-black text-slate-900">
              Communiquez avec vos abonnés
            </h2>
            <p className="text-slate-500 font-medium">
              Diffusez vos actualités et événements
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedAnnonce(null);
            setIsModalOpen(true);
          }}
          className="w-full text-sm md:text-base md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 md:px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-100"
        >
          <Plus size={20} /> Nouvelle Annonce
        </button>
      </div>

      {/* FILTRES (TITRE & DATE) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="text-sm text-slate-500">Recherche par titre :</span>
          <Search
            className="absolute left-4 top-12 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher par titre..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <span className="text-sm text-slate-500">
            Filtre par date de création :
          </span>
          <CalendarIcon
            className="absolute left-4 top-12 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="date"
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
          <p className="font-bold text-slate-400">
            Synchronisation des données...
          </p>
        </div>
      ) : filteredAnnonces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnnonces.map((annonce) => (
              <AnnonceCard
                key={annonce.id}
                annonce={annonce}
                onEdit={() => handleEdit(annonce)}
                onDeleteSuccess={() => handleDeleteSuccess(annonce.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-[2.5rem] py-20 text-center border-2 border-dashed border-slate-200">
          <LayoutGrid className="mx-auto text-slate-300 mb-4" size={64} />
          <p className="text-slate-500 font-bold text-xl mb-6">
            Aucune annonce correspondant à vos critères
          </p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-2xl font-bold hover:bg-orange-800 transition-all shadow-lg shadow-orange-200"
          >
            <RefreshCw size={18} />
            Actualiser la page
          </button>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <AnnonceModal
            annonce={selectedAnnonce}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchAnnonces();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
