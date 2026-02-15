"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, PlusCircle, Inbox } from "lucide-react";
import Link from "next/link";
import ChallengeCard from "../ChallengeCard";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackToTop from "../BackToTop";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ChallengesClient() {
  const [active, setActive] = useState("En cours");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <div className="bg-white p-6 rounded-xl mt-14 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Toaster />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vos challenges</h2>
          <p className="text-slate-500">
            Gérez vos compétitions et suivez les participations.
          </p>
        </div>
        <Link
          href="/challenge/create"
          className="bg-orange-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-800 transition-all shadow-md active:scale-95"
        >
          <PlusCircle size={20} /> Organiser un challenge
        </Link>
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
