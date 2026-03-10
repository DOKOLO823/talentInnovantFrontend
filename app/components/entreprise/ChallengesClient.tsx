"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Loader2,
  PlusCircle,
  Inbox,
  MessageCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import ChallengeCard from "../ChallengeCard";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackToTop from "../BackToTop";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ChallengeTypeModal from "./modals/ChallengeTypeModal";

export default function ChallengesClient() {
  const [active, setActive] = useState("En cours");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [soldeEntreprise, setSoldeEntreprise] = useState(0);
  const [loadingSolde, setLoadingSolde] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSolde = async () => {
      try {
        setLoadingSolde(true);
        const response = await apiFetch("/entreprise/solde", {
          method: "GET",
        });
        if (response?.statut === 200) {
          setSoldeEntreprise(response.solde);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du solde", error);
      } finally {
        setLoadingSolde(false);
      }
    };
    fetchSolde();
  }, []);

  const [data, setData] = useState({
    enCours: [] as any[],
    termines: [] as any[],
    avenir: [] as any[],
  });

  const fetchData = async () => {
    const userStr = localStorage.getItem("auth");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const [resEnCours, resTermines, resAvenir] = await Promise.all([
        apiFetch("/entreprise/meschallenges/en-cours", { method: "GET" }),
        apiFetch("/entreprise/meschallenges/termines", { method: "GET" }),
        apiFetch("/entreprise/meschallenges/avenir", { method: "GET" }),
      ]);

      const processData = (list: any[]) => {
        if (!list) return [];
        return list.map((c: any) => {
          let rewardsArray = ["Prix non défini"];
          try {
            if (typeof c.recompense === "string" && c.recompense != "null") {
              const parsed = JSON.parse(c.recompense);
              rewardsArray = Object.values(parsed);
            }
          } catch (e) {
            console.error(e);
          }

          return {
            ...c,
            title: c.titre,
            image:
              (c.photo && apifile + "/" + c.photo) ||
              "/assets/images/innov.jpg",
            locationType: c.lieu || "En ligne",
            startDate: c.datelancement,
            endDate: c.datefin,
            endInscription: c.datefininscription,
            participants: c.nombrecompetiteur || 0,
            rewards: rewardsArray,
            categories:
              c.domaines && c.domaines.length > 0
                ? c.domaines.map((d: any) => d.nom)
                : ["Général"],
            entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
            entrepriseLogo: c.user?.pp
              ? `${apifile}/${c.user.pp}`
              : "../assets/images/ppe.png",
            entrepriseId: c.user_id,
          };
        });
      };

      setData({
        enCours: processData(resEnCours?.challenges_en_cours),
        termines: processData(resTermines?.challenges_termines),
        avenir: processData(resAvenir?.challenges_avenir),
      });
      // console.log(resEnCours);
    } catch (err) {
      console.error("Erreur chargement challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentList = useMemo(() => {
    if (active === "En cours") return data.enCours;
    if (active === "Terminés") return data.termines;
    return data.avenir;
  }, [active, data]);

  const filtered = useMemo(() => {
    return currentList.filter((c: any) =>
      c.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [currentList, query]);

  const EmptyState = () => {
    if (active === "En cours")
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed">
          <Inbox className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Aucun challenge en cours.</p>
          <button
            onClick={() => setActive("À venir")}
            className="mt-4 text-orange-700 font-semibold hover:underline"
          >
            Voir les challenges à venir →
          </button>
        </div>
      );
    if (active === "Terminés")
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed">
          <Inbox className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">
            Vous n'avez pas encore de challenges terminés.
          </p>
          <button
            onClick={() => setActive("En cours")}
            className="mt-4 text-orange-700 font-semibold hover:underline"
          >
            Voir les challenges en cours →
          </button>
        </div>
      );
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed">
        <Inbox className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Aucun challenge prévu pour le moment.</p>
        <button
          onClick={() => setActive("En cours")}
          className="mt-4 text-orange-700 font-semibold hover:underline"
        >
          Retour aux challenges en cours →
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl mt-14 shadow-sm border border-slate-100 space-y-8">
        <Toaster />
        {/* 1. Header de la page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Vos challenges
            </h2>
            <p className="text-slate-500 mt-1">
              Gérez vos compétitions et suivez les participations en temps réel.
            </p>
          </div>
        </div>
        {/* 2. Cadre de gestion du Solde */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Wallet size={120} />
          </div>

          <div className="flex items-center gap-6 z-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <Wallet className="text-orange-600" size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                Solde actuel de l'entreprise
              </p>
              <div className="flex items-baseline gap-2">
                {loadingSolde ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2
                      className="animate-spin text-slate-500"
                      size={24}
                    />
                    <span className="text-slate-400 font-medium italic text-sm">
                      Chargement...
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl md:text-4xl font-black text-slate-800">
                      {soldeEntreprise.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-slate-500">
                      FCFA
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
            <div className="text-center md:text-start">
              <p className="text-slate-600 font-medium text-sm">
                Besoin d'augmenter votre capacité ?
              </p>
              <p className="text-slate-500 text-xs italic">
                Contactez-nous via WhatsApp pour recharger votre solde.
              </p>
            </div>

            <a
              href={`https://wa.me/+237655624168?text=${encodeURIComponent("Je suis une entreprise inscrite sur Talent Innovant, je viens pour recharger mon solde.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-green-100 w-full sm:w-auto justify-center"
            >
              <MessageCircle size={20} />
              Recharger le solde
            </a>
          </div>
        </div>

        {/* Bouton d'action principal */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={loadingSolde}
          className={`w-full md:w-auto bg-orange-700 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-orange-800 transition-all shadow-lg shadow-orange-100 active:scale-95 font-bold text-lg ${loadingSolde ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <PlusCircle size={22} /> Organiser ou publier un challenge
        </button>

        {/* Modal réutilisable appelé ici */}
        <ChallengeTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          solde={soldeEntreprise}
        />
      </div>

      {/* Barre de navigation et recherche FIXE au scroll */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-100 transition-all">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Conteneur des onglets avec overflow horizontal sur mobile */}
          <div className="overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit whitespace-nowrap">
              {[
                { n: "En cours", count: data.enCours.length },
                { n: "Terminés", count: data.termines.length },
                { n: "À venir", count: data.avenir.length },
              ].map((tab) => (
                <button
                  key={tab.n}
                  onClick={() => {
                    setActive(tab.n);
                    setQuery("");
                  }}
                  className={`px-4 py-2 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${
                    active === tab.n
                      ? "bg-white text-orange-700 shadow-sm"
                      : "text-slate-600 hover:text-orange-600"
                  }`}
                >
                  {tab.n}
                  {!loading && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${active === tab.n ? "bg-orange-100" : "bg-slate-200"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:ml-auto w-full lg:max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm bg-white"
              placeholder={`Rechercher dans ${active.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="animate-spin text-orange-700" size={40} />
        </div>
      ) : (
        <div className="pb-10">
          {currentList.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border">
              <Search className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-slate-500">
                Aucun challenge {active.toLowerCase()} ne correspond au mot clé
                : <span className="font-bold text-slate-800">"{query}"</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c: any) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </div>
      )}

      <BackToTop />
    </div>
  );
}
