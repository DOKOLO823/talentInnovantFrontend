// app/communaute/meschallenges/page.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ChallengeCard from "../../components/ChallengeCard";
import {
  Activity,
  CheckCircle,
  ChevronDown,
  Loader2,
  Timer,
  Orbit,
  Plus,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../../components/BackButton";
import { Toaster } from "react-hot-toast";
import TalentChallengeTypeModal from "../components/TalentChallengeTypeModal";

export default function MesChallengesPage() {
  const [activeTab, setActiveTab] = useState("en_cours");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Partout");
  const [showModal, setShowModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [stats, setStats] = useState({
    enCours: 0,
    avenir: 0,
    termines: 0,
    total: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [challengesEnCours, setChallengesEnCours] = useState<any[]>([]);
  const [challengesAvenir, setChallengesAvenir] = useState<any[]>([]);
  const [challengesTermines, setChallengesTermines] = useState<any[]>([]);
  const [domaines, setDomaines] = useState<any[]>([]);

  const [villesEnCours, setVillesEnCours] = useState(["Partout"]);
  const [villesAvenir, setVillesAvenir] = useState(["Partout"]);
  const [villesTermines, setVillesTermines] = useState(["Partout"]);

  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { token, user } = useAuth();
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);

  const subTabs = [
    {
      key: "en_cours",
      label: "Mes challenges en cours",
      description:
        "Les challenges que vous avez créés ou publiés et qui sont actuellement en cours.",
    },
    {
      key: "avenir",
      label: "Mes challenges à venir",
      description:
        "Vos challenges créés ou publiés qui n'ont pas encore démarré.",
    },
    {
      key: "termines",
      label: "Mes challenges terminés",
      description:
        "Les challenges que vous avez créés ou publiés et qui sont maintenant clôturés.",
    },
  ];

  const extractDomaines = (challenges: any[]) => {
    const all = new Set<string>();
    challenges.forEach((c: any) => {
      if (Array.isArray(c.domaines))
        c.domaines.forEach((d: any) => all.add(d.nom || d.name));
    });
    return Array.from(all);
  };

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [statsRes, enCoursRes] = await Promise.all([
          apiFetch("/mes-challenges-talent/stats", { method: "GET" }),
          apiFetch("/mes-challenges-talent/en-cours", { method: "GET" }),
        ]);

        if (statsRes?.statut === 200) {
          setStats(statsRes.stats);
          setStatsLoaded(true);
        }
        if (enCoursRes?.statut === 200) {
          const ch = enCoursRes.challenges_en_cours || [];
          setChallengesEnCours(ch);
          setVillesEnCours(enCoursRes.villes || ["Partout"]);
          setDomaines(extractDomaines(ch));
        }
        setInitialLoadComplete(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    const loadTab = async () => {
      if (!token || !initialLoadComplete) return;
      if (activeTab === "en_cours") return;
      if (activeTab === "avenir" && challengesAvenir.length > 0) return;
      if (activeTab === "termines" && challengesTermines.length > 0) return;

      setLoading(true);
      try {
        if (activeTab === "avenir") {
          const res = await apiFetch("/mes-challenges-talent/avenir", {
            method: "GET",
          });
          if (res?.statut === 200) {
            setChallengesAvenir(res.challenges_avenir || []);
            setVillesAvenir(res.villes || ["Partout"]);
          }
        } else if (activeTab === "termines") {
          const res = await apiFetch("/mes-challenges-talent/termines", {
            method: "GET",
          });
          if (res?.statut === 200) {
            setChallengesTermines(res.challenges_termines || []);
            setVillesTermines(res.villes || ["Partout"]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadTab();
  }, [activeTab, token, initialLoadComplete]);

  useEffect(() => {
    setSelectedLocation("Partout");
  }, [activeTab]);

  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const getCurrentChallenges = () => {
    if (activeTab === "en_cours") return challengesEnCours;
    if (activeTab === "avenir") return challengesAvenir;
    if (activeTab === "termines") return challengesTermines;
    return [];
  };

  const getCurrentVilles = () => {
    if (activeTab === "en_cours") return villesEnCours;
    if (activeTab === "avenir") return villesAvenir;
    if (activeTab === "termines") return villesTermines;
    return ["Partout"];
  };

  const filteredChallenges = useMemo(() => {
    let ch = getCurrentChallenges();
    if (searchQuery.trim())
      ch = ch.filter((c: any) =>
        c.titre?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    if (selectedDomain)
      ch = ch.filter(
        (c: any) =>
          Array.isArray(c.domaines) &&
          c.domaines.some((d: any) => (d.nom || d.name) === selectedDomain),
      );
    if (selectedLocation && selectedLocation !== "Partout") {
      ch = ch.filter((c: any) => {
        const lieu = c.lieu?.toLowerCase();
        if (selectedLocation === "En ligne")
          return lieu === "en ligne" || lieu === "hybride";
        return c.ville?.toLowerCase() === selectedLocation.toLowerCase();
      });
    }
    return ch;
  }, [
    activeTab,
    searchQuery,
    selectedDomain,
    selectedLocation,
    challengesEnCours,
    challengesAvenir,
    challengesTermines,
  ]);

  const mapChallenge = (c: any) => ({
    id: c.id,
    user_id: c.user_id,
    title: c.titre,
    description: c.description,
    image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
    locationType: c.lieu || "",
    site: c.site || "",
    startDate: c.datelancement || "",
    endDate: c.datefin || "",
    endInscription: c.datefininscription,
    participants: c.participants_count || 0,
    rewards: (() => {
      try {
        if (typeof c.recompense === "string" && c.recompense !== "null")
          return Object.values(JSON.parse(c.recompense));
        if (Array.isArray(c.recompense)) return c.recompense;
      } catch {}
      return ["Prix non défini"];
    })(),
    categories: Array.isArray(c.domaines)
      ? c.domaines.map((d: any) => d.nom || d.name)
      : ["Innovation"],
    inscriptionEnd: c.datefininscription || "Bientôt",
    entrepriseNom: c.user?.talent?.nom || "Talent",
    entrepriseLogo: c.user?.pp
      ? `${apifile}/${c.user.pp}`
      : "/assets/images/pp2.png",
    entrepriseId: c.user_id,
  });

  const statCards = [
    {
      key: "en_cours",
      label: "En cours",
      value: stats.enCours,
      icon: Timer,
      tab: "en_cours",
    },
    {
      key: "avenir",
      label: "À venir",
      value: stats.avenir,
      icon: Orbit,
      tab: "avenir",
    },
    {
      key: "termines",
      label: "Terminés",
      value: stats.termines,
      icon: CheckCircle,
      tab: "termines",
    },
    {
      key: "total",
      label: "Total",
      value: stats.total,
      icon: Activity,
      tab: null,
    },
  ];

  const currentTabInfo = subTabs.find((t) => t.key === activeTab);

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <Toaster />
      <BackButton m={16} />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Mes Challenges créés ou publiés
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Les challenges que j'ai créés ou publiés sur Talent Innovant
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ key, label, value, icon: Icon, tab }) => (
            <div
              key={key}
              onClick={() => tab && setActiveTab(tab)}
              className={cn(
                "relative bg-white rounded-xl px-4 pt-4 pb-2 shadow-sm border-t-4 border-orange-700 text-left transition-all duration-300 hover:shadow-xl",
                tab ? "cursor-pointer" : "",
              )}
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!statsLoaded ? (
                  <Loader2 className="w-5 h-5 animate-spin text-orange-700" />
                ) : (
                  value
                )}
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3 flex flex-col items-center gap-1">
                {label} {tab && <ChevronDown size={12} />}
              </p>
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-orange-100">
                <Icon size={12} className="text-orange-700" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-1">
            Organiser ou publier un challenge
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Créez un nouveau challenge sur Talent Innovant ou partagez un
            challenge externe. Gratuit pour les talents !
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-md shadow-orange-100"
          >
            <Plus size={16} /> Organiser ou publier un challenge
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div
            className="flex overflow-x-auto scrollbar-hide border-b border-gray-100"
            ref={tabsRef}
          >
            {subTabs.map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  activeTab === tab.key
                    ? "text-orange-700 border-orange-700 font-semibold"
                    : "text-gray-600 border-transparent hover:text-orange-600",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Description sous-tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-5 py-3 bg-orange-50/40 border-b border-orange-100/50"
            >
              <p className="text-sm text-orange-800 border-l-4 border-orange-700 pl-3 font-medium">
                {currentTabInfo?.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Filtres */}
          <div className="px-5 pt-3">
            <div className="flex gap-3 items-center overflow-x-auto scrollbar-hide">
              <Input
                placeholder="Rechercher un challenge..."
                className="rounded-xl min-w-[220px] max-w-[280px] flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {domaines.length > 0 && (
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white min-w-[160px]"
                >
                  <option value="">Tous les domaines</option>
                  {domaines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {!loading ? (
            <div className="px-5 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {getCurrentVilles().map((ville) => (
                  <button
                    key={ville}
                    onClick={() => setSelectedLocation(ville)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all",
                      selectedLocation === ville
                        ? "bg-orange-700 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm",
                    )}
                  >
                    {ville}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 flex gap-2">
              {[80, 110, 90, 100, 80].map((w, i) => (
                <div
                  key={i}
                  className="h-8 rounded-full bg-gray-200 animate-pulse"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Liste challenges */}
        <div className="mt-5">
          {loading ? (
            <div className="flex py-20 w-full justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
            </div>
          ) : filteredChallenges.length > 0 ? (
            <section className="flex flex-wrap gap-5 justify-center max-w-8xl mx-auto">
              {filteredChallenges.map((c: any) => (
                <ChallengeCard key={c.id} challenge={mapChallenge(c)} />
              ))}
            </section>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg font-medium mb-3">
                {activeTab === "en_cours"
                  ? "Aucun de mes challenges en cours"
                  : activeTab === "avenir"
                    ? "Aucun de mes challenges à venir"
                    : "Aucun de mes challenges terminés"}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {activeTab === "en_cours"
                  ? "Créez votre premier challenge pour le voir apparaître ici."
                  : "Aucun challenge dans cette catégorie pour le moment."}
              </p>
              {activeTab === "en_cours" && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-orange-700 hover:bg-orange-800 text-white"
                >
                  <Plus size={15} className="mr-2" /> Créer un challenge
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <TalentChallengeTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {showBackToTop && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-5 z-50 p-3 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
