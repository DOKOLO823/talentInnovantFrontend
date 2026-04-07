"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChallengeCard from "../components/ChallengeCard";
import {
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Loader2,
  Timer,
  Heart,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../components/BackButton";

type SubTab =
  | "mes_en_cours"
  | "mes_termines"
  | "favoris_en_cours"
  | "favoris_termines";

export default function MesChallengesPage() {
  const [activeTab, setActiveTab] = useState<SubTab>("mes_en_cours");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Partout");

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Données par onglet
  const [mesChallengesEnCours, setMesChallengesEnCours] = useState<any[]>([]);
  const [mesChallengesTermines, setMesChallengesTermines] = useState<any[]>([]);
  const [favorisEnCours, setFavorisEnCours] = useState<any[]>([]);
  const [favorisTermines, setFavorisTermines] = useState<any[]>([]);

  // Villes par onglet
  const [villesMesEnCours, setVillesMesEnCours] = useState(["Partout"]);
  const [villesMesTermines, setVillesMesTermines] = useState(["Partout"]);
  const [villesFavorisEnCours, setVillesFavorisEnCours] = useState(["Partout"]);
  const [villesFavorisTermines, setVillesFavorisTermines] = useState([
    "Partout",
  ]);

  // Domaines
  const [domaines, setDomaines] = useState<any[]>([]);

  // Loading states par onglet (pour ne pas recharger inutilement)
  const [loadedTabs, setLoadedTabs] = useState<Set<SubTab>>(new Set());
  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] =
    useState<boolean>(false);

  const [stats, setStats] = useState({
    mesEnCours: 0,
    mesTermines: 0,
    favorisEnCours: 0,
    favorisTermines: 0,
  });

  const { talent, user, loading: authLoading, token } = useAuth();
  const userName = talent?.nom || "";

  const tabsSectionRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/home");
    }
  }, [authLoading, user, router]);

  const scrollToTab = (tabName: string) => {
    if (tabsContainerRef.current) {
      const tabButton = tabsContainerRef.current.querySelector(
        `button[data-tab="${tabName}"]`,
      );
      if (tabButton) {
        tabButton.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  const navigateToTab = (tab: SubTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      if (tabsSectionRef.current) {
        const yOffset = showNavbar ? -64 : 0;
        const y =
          tabsSectionRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      scrollToTab(tab);
    }, 100);
  };

  // Extraction des domaines depuis une liste de challenges
  const extractDomaines = (challenges: any[]) => {
    const allDomaines = new Set<string>();
    challenges.forEach((c: any) => {
      if (Array.isArray(c.domaines)) {
        c.domaines.forEach((d: any) => allDomaines.add(d.nom || d.name));
      }
    });
    return Array.from(allDomaines);
  };

  // Extraction des villes
  const extractVilles = (challenges: any[]): string[] => {
    const villes = new Set<string>();
    challenges.forEach((c: any) => {
      if (c.lieu) {
        const lieu = c.lieu.toLowerCase().trim();
        if (lieu === "en ligne" || lieu === "hybride") {
          villes.add("En ligne");
        }
        if (
          ["présentiel", "en présentiel", "presentiel", "hybride"].includes(
            lieu,
          ) &&
          c.ville
        ) {
          villes.add(
            c.ville.charAt(0).toUpperCase() + c.ville.slice(1).toLowerCase(),
          );
        }
      }
    });
    return ["Partout", ...Array.from(villes).sort()];
  };

  // Chargement initial : mes challenges en cours + stats
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      try {
        setLoadingChallenges(true);

        const [
          mesEnCoursRes,
          mesTerminesRes,
          nbrFavorisEnCoursRes,
          nbrFavorisTerminesRes,
        ] = await Promise.all([
          apiFetch("/mes-challenges/en-cours", { method: "GET" }),
          apiFetch("/meschallenges/termines", { method: "GET" }),
          apiFetch("/challenges/suivis/nombre", { method: "GET" }),
          apiFetch("/challenges/suivis/nombre-termines", { method: "GET" }),
        ]);

        if (mesEnCoursRes?.statut === 200) {
          const challenges = mesEnCoursRes.mes_challenges || [];
          setMesChallengesEnCours(challenges);
          setVillesMesEnCours(extractVilles(challenges));
          setDomaines(extractDomaines(challenges));
          setLoadedTabs((prev) => new Set(prev).add("mes_en_cours"));
        }

        let mesTerminesCount = 0;
        if (mesTerminesRes?.statut === 200) {
          const challenges = mesTerminesRes.mes_challenges_termines || [];
          setMesChallengesTermines(challenges);
          setVillesMesTermines(extractVilles(challenges));
          mesTerminesCount = challenges.length;
          setLoadedTabs((prev) => new Set(prev).add("mes_termines"));
        }

        setStats({
          mesEnCours: mesEnCoursRes?.mes_challenges?.length || 0,
          mesTermines: mesTerminesCount,
          favorisEnCours:
            nbrFavorisEnCoursRes?.nombre_challenges_suivis_en_cours || 0,
          favorisTermines:
            nbrFavorisTerminesRes?.nombre_challenges_suivis_termines || 0,
        });

        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Erreur chargement initial:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Chargement au changement d'onglet
  useEffect(() => {
    const fetchTabData = async () => {
      if (!token || !initialLoadComplete) return;
      if (loadedTabs.has(activeTab)) {
        setLoadingChallenges(false);
        return;
      }

      setLoadingChallenges(true);
      try {
        if (activeTab === "favoris_en_cours") {
          const res = await apiFetch("/challenges-suivis", { method: "GET" });
          if (res?.statut === 200) {
            // Filtrer les challenges suivis en cours
            const all = res.challenges || [];
            const enCours = all.filter((c: any) => c.statut === "En cours");
            const termines = all.filter((c: any) => c.statut === "Terminé");
            setFavorisEnCours(enCours);
            setFavorisTermines(termines);
            setVillesFavorisEnCours(extractVilles(enCours));
            setVillesFavorisTermines(extractVilles(termines));
            setDomaines((prev) => {
              const newDomaines = new Set([...prev, ...extractDomaines(all)]);
              return Array.from(newDomaines);
            });
            setLoadedTabs((prev) =>
              new Set(prev).add("favoris_en_cours").add("favoris_termines"),
            );
          }
        } else if (activeTab === "favoris_termines") {
          if (!loadedTabs.has("favoris_en_cours")) {
            const res = await apiFetch("/challenges-suivis", { method: "GET" });
            if (res?.statut === 200) {
              const all = res.challenges || [];
              const enCours = all.filter((c: any) => c.statut === "En cours");
              const termines = all.filter((c: any) => c.statut === "Terminé");
              setFavorisEnCours(enCours);
              setFavorisTermines(termines);
              setVillesFavorisEnCours(extractVilles(enCours));
              setVillesFavorisTermines(extractVilles(termines));
              setLoadedTabs((prev) =>
                new Set(prev).add("favoris_en_cours").add("favoris_termines"),
              );
            }
          }
        }
      } catch (error) {
        console.error("Erreur chargement onglet:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchTabData();
  }, [activeTab, token, initialLoadComplete]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNavbar(window.scrollY < lastScrollY);
      } else {
        setShowNavbar(true);
      }
      setShowBackToTop(window.scrollY > 300);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setSelectedLocation("Partout");
  }, [activeTab]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const getCurrentChallenges = () => {
    if (activeTab === "mes_en_cours") return mesChallengesEnCours;
    if (activeTab === "mes_termines") return mesChallengesTermines;
    if (activeTab === "favoris_en_cours") return favorisEnCours;
    if (activeTab === "favoris_termines") return favorisTermines;
    return [];
  };

  const getCurrentVilles = () => {
    if (activeTab === "mes_en_cours") return villesMesEnCours;
    if (activeTab === "mes_termines") return villesMesTermines;
    if (activeTab === "favoris_en_cours") return villesFavorisEnCours;
    if (activeTab === "favoris_termines") return villesFavorisTermines;
    return ["Partout"];
  };

  const filteredChallenges = useMemo(() => {
    let challenges = getCurrentChallenges();

    if (searchQuery.trim()) {
      challenges = challenges.filter((c: any) =>
        c.titre?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedDomain && selectedDomain !== "") {
      challenges = challenges.filter((c: any) => {
        if (Array.isArray(c.domaines)) {
          return c.domaines.some(
            (d: any) => (d.nom || d.name) === selectedDomain,
          );
        }
        return false;
      });
    }

    if (selectedLocation && selectedLocation !== "Partout") {
      challenges = challenges.filter((c: any) => {
        const lieu = c.lieu?.toLowerCase();
        const ville = c.ville?.toLowerCase();
        if (selectedLocation === "En ligne") {
          return lieu === "en ligne" || lieu === "hybride";
        } else {
          return ville === selectedLocation.toLowerCase();
        }
      });
    }

    return challenges;
  }, [
    activeTab,
    searchQuery,
    selectedDomain,
    selectedLocation,
    mesChallengesEnCours,
    mesChallengesTermines,
    favorisEnCours,
    favorisTermines,
  ]);

  const mapChallenge = (c: any) => ({
    id: c.id,
    user_id: c.user_id,
    title: c.titre,
    image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
    locationType: c.lieu || "",
    site: c.site || "",
    startDate: c.datelancement || "",
    endDate: c.datefin || "",
    endInscription: c.datefininscription,
    participants: c.participants_count || 0,
    rewards: (() => {
      let rewardsArray = ["Prix non défini"];
      try {
        if (typeof c.recompense === "string" && c.recompense !== "null") {
          const parsed = JSON.parse(c.recompense);
          rewardsArray = Object.values(parsed);
        } else if (Array.isArray(c.recompense)) {
          rewardsArray = c.recompense;
        }
      } catch (e) {
        console.error("Erreur parsing récompenses:", e);
      }
      return rewardsArray;
    })(),
    categories: Array.isArray(c.domaines)
      ? c.domaines.map((d: any) => d.nom || d.name)
      : ["Innovation"],
    inscriptionEnd: c.datefininscription || "Bientôt",
    entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
    entrepriseLogo: c.user?.pp
      ? `${apifile}/${c.user.pp}`
      : "../assets/images/ppe.png",
    entrepriseId: c.user_id,
  });

  const renderEmptyState = () => {
    if (activeTab === "mes_en_cours") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun challenge en cours
            {searchQuery && (
              <>
                {" "}
                avec ce mot clé :{" "}
                <span className="font-bold">{searchQuery}</span>
              </>
            )}
          </p>
          {!searchQuery && (
            <p className="text-gray-500 text-sm mb-6">
              Vous ne participez à aucun challenge en cours
            </p>
          )}
          <Button
            onClick={() => navigateToTab("mes_termines")}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes challenges terminés
          </Button>
        </div>
      );
    } else if (activeTab === "mes_termines") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun challenge terminé
            {searchQuery && (
              <>
                {" "}
                avec ce mot clé :{" "}
                <span className="font-bold">{searchQuery}</span>
              </>
            )}
          </p>
          {!searchQuery && (
            <p className="text-gray-500 text-sm mb-6">
              Vous n'avez participé à aucun challenge terminé
            </p>
          )}
          <Button
            onClick={() => navigateToTab("favoris_en_cours")}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes favoris en cours
          </Button>
        </div>
      );
    } else if (activeTab === "favoris_en_cours") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun favori en cours
            {searchQuery && (
              <>
                {" "}
                avec ce mot clé :{" "}
                <span className="font-bold">{searchQuery}</span>
              </>
            )}
          </p>
          {!searchQuery && (
            <p className="text-gray-500 text-sm mb-6">
              Vous ne suivez aucun challenge en cours
            </p>
          )}
          <Button
            onClick={() => navigateToTab("favoris_termines")}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes favoris terminés
          </Button>
        </div>
      );
    } else if (activeTab === "favoris_termines") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun favori terminé
            {searchQuery && (
              <>
                {" "}
                avec ce mot clé :{" "}
                <span className="font-bold">{searchQuery}</span>
              </>
            )}
          </p>
          {!searchQuery && (
            <p className="text-gray-500 text-sm mb-6">
              Vous ne suivez aucun challenge terminé
            </p>
          )}
          <Button
            onClick={() => navigateToTab("mes_en_cours")}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes challenges en cours
          </Button>
        </div>
      );
    }
    return null;
  };

  const tabsTopPosition = showNavbar ? "top-16" : "top-0";

  const tabLabels: Record<SubTab, string> = {
    mes_en_cours: "Mes challenges en cours",
    mes_termines: "Mes challenges terminés",
    favoris_en_cours: "Favoris en cours",
    favoris_termines: "Favoris terminés",
  };

  const tabDescriptions: Record<SubTab, string> = {
    mes_en_cours: "Les challenges auxquels vous participez actuellement.",
    mes_termines:
      "Historique des challenges auxquels vous avez participé et qui sont clos.",
    favoris_en_cours:
      "Les challenges que vous suivez et qui acceptent encore des participations.",
    favoris_termines:
      "Les challenges que vous avez mis en favoris mais qui sont désormais terminés.",
  };

  return (
    <div className="pb-32">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
        animate={{ y: showNavbar ? 0 : -100 }}
      ></motion.div>
      <div className="h-16" />
      <div className="ml-5">
        <BackButton m={1} />
      </div>

      {/* Hero Section */}
      <section className="bg-white px-6 py-10 md:py-16 border-b border-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left mb-8"
          >
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              Mes Challenges 🏆
            </h1>
            <p className="mt-2 text-base md:text-lg text-gray-500">
              Retrouvez tous les challenges auxquels vous participez et vos
              favoris.
            </p>
          </motion.div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
            {/* Mes challenges en cours */}
            <div
              onClick={() => navigateToTab("mes_en_cours")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.mesEnCours
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Mes challenges en cours <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Timer size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Mes challenges terminés */}
            <div
              onClick={() => navigateToTab("mes_termines")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.mesTermines
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Mes challenges terminés <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <CheckCircle size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Favoris en cours */}
            <div
              onClick={() => navigateToTab("favoris_en_cours")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.favorisEnCours
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Mes challenges favoris en cours <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Heart size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Favoris terminés */}
            <div
              onClick={() => navigateToTab("favoris_termines")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.favorisTermines
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Mes challenges favoris terminés <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Star size={14} className="text-orange-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Sticky */}
      <div
        className={cn(
          "sticky bg-white z-40 shadow transition-all duration-300",
          tabsTopPosition,
        )}
        ref={tabsSectionRef}
      >
        <div
          className="flex overflow-x-auto px-5 pt-3 gap-4 scrollbar-hide"
          ref={tabsContainerRef}
        >
          {(Object.keys(tabLabels) as SubTab[]).map((tab) => (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => {
                setActiveTab(tab);
                scrollToTab(tab);
              }}
              className={cn(
                "pb-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab
                  ? "text-orange-700 border-b-3 border-orange-700 font-semibold"
                  : "text-gray-700 hover:text-orange-600",
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Recherche et Filtres */}
        <div className="px-5 pt-2">
          <div className=" py-2 mb-1">
            <motion.p
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-orange-800 bg-orange-50/50 border-l-4 border-orange-700 py-2 px-3 rounded-r-lg font-medium"
            >
              {tabDescriptions[activeTab]}
            </motion.p>
          </div>

          <div className="flex gap-3 items-center overflow-x-auto scrollbar-hide">
            <Input
              placeholder="Rechercher un challenge par titre..."
              className="rounded-xl min-w-[250px] max-w-[300px] flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {domaines?.length > 0 && (
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white min-w-[180px]"
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

        {!loadingChallenges ? (
          <div className="px-5 py-3 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {getCurrentVilles()?.map((ville) => (
                <button
                  key={ville}
                  className={cn(
                    "px-4 py-1 rounded-full text-sm whitespace-nowrap transition-all",
                    selectedLocation === ville
                      ? "bg-orange-700 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm",
                  )}
                  onClick={() => setSelectedLocation(ville)}
                >
                  {ville}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-full bg-gray-200 animate-pulse shrink-0 shadow-sm border border-gray-100"
                  style={{ width: i % 2 === 0 ? "80px" : "110px" }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Liste des cartes */}
      <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
        {loadingChallenges ? (
          <div className="flex py-20 w-full justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
          </div>
        ) : filteredChallenges?.length > 0 ? (
          filteredChallenges.map((c: any) => (
            <ChallengeCard key={c.id} challenge={mapChallenge(c)} />
          ))
        ) : (
          renderEmptyState()
        )}
      </section>

      {showBackToTop && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-50 p-3 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
