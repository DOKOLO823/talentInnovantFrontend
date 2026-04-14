"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChallengeCard from "../components/ChallengeCard";
import PartenairesAccueil from "./components/PartenairesAccueil";
import {
  Activity,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Loader2,
  Orbit,
  Timer,
  Sparkles,
  Rocket,
  Target,
  Lightbulb,
  Trophy,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import CoachGeneralBanner from "../components/coach/CoachGeneralBanner";
import { CoachBannerSkeleton } from "./components/CoachBannerSkeleton";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Challenges en cours");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Partout");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [challengesEnCours, setChallengesEnCours] = useState<any[]>([]);
  const [challengesTermines, setChallengesTermines] = useState<any[]>([]);
  const [challengesAvenir, setChallengesAvenir] = useState<any[]>([]);
  const [domaines, setDomaines] = useState<any[]>([]);

  const [villesEnCours, setVillesEnCours] = useState(["Partout"]);
  const [villesAvenir, setVillesAvenir] = useState(["Partout"]);
  const [villesTermines, setVillesTermines] = useState(["Partout"]);

  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] =
    useState<boolean>(false);

  const [stats, setStats] = useState({
    enCours: 0,
    avenir: 0,
    termines: 0,
    total: 0,
  });

  // --- LOGIQUE MESSAGES ANIMÉS ---
  const welcomeMessages = [
    {
      text: "Prêt à relever les défis qui feront briller votre talent ?",
      icon: <Sparkles className="text-orange-500" size={22} />,
    },
    {
      text: "Propulsez vos idées et transformez-les en opportunités réelles.",
      icon: <Rocket className="text-orange-500" size={22} />,
    },
    {
      text: "Trouvez le challenge parfait pour booster votre portfolio.",
      icon: <Target className="text-orange-500" size={22} />,
    },
    {
      text: "L'innovation n'attend que vous. Exprimez votre créativité.",
      icon: <Lightbulb className="text-orange-500" size={22} />,
    },
    {
      text: "Devenez le prochain champion de l'innovation technologique.",
      icon: <Trophy className="text-orange-500" size={22} />,
    },
  ];
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % welcomeMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const navigateToTab = (tab: string) => {
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

  // N'oublie pas d'ajouter useCallback dans tes imports 'react'
  const fetchInitialData = useCallback(async () => {
    if (!token) {
      setIsProfileLoading(false);
      setLoadingChallenges(false);
      return;
    }

    // 1. ISOLATION DU CHARGEMENT DU PROFIL (COACH)
    const loadProfile = async () => {
      setProfileError(false);
      setIsProfileLoading(true);
      try {
        const profileRes = await apiFetch(`/talent/profil/${user.id}`, {
          method: "GET",
        });
        if (profileRes?.statut === 200) {
          setUserProfile(profileRes);
        } else {
          setProfileError(true);
        }
      } catch (err) {
        setProfileError(true);
      } finally {
        setIsProfileLoading(false);
      }
    };

    // 2. CHARGEMENT DES CHALLENGES ET STATS
    const loadChallenges = async () => {
      setLoadingChallenges(true);
      try {
        const [enCoursRes, avenirRes, terminesRes] = await Promise.all([
          apiFetch("/challenges/en-cours", { method: "GET" }),
          apiFetch("/challenges/avenir", { method: "GET" }),
          apiFetch("/challenges/end", { method: "GET" }),
        ]);

        if (enCoursRes?.statut === 200) {
          const challenges = enCoursRes.challenges_en_cours || [];
          setChallengesEnCours(challenges);
          // console.log(challenges);
          setVillesEnCours(enCoursRes.villes || ["Partout"]);

          const allDomaines = new Set<string>();
          challenges.forEach((c: any) => {
            if (Array.isArray(c.domaines)) {
              c.domaines.forEach((d: any) => allDomaines.add(d.nom || d.name));
            }
          });
          setDomaines(Array.from(allDomaines));
        }

        const avenirCount =
          avenirRes?.statut === 200
            ? avenirRes.challenges_avenir?.length || 0
            : 0;
        const terminesCount =
          terminesRes?.statut === 200
            ? terminesRes.challenges_termines?.length || 0
            : 0;
        const enCoursCount =
          enCoursRes?.statut === 200
            ? enCoursRes.challenges_en_cours?.length || 0
            : 0;

        setStats({
          enCours: enCoursCount,
          avenir: avenirCount,
          termines: terminesCount,
          total: enCoursCount + avenirCount + terminesCount,
        });

        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Erreur challenges:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    // Lancement parallèle
    loadProfile();
    loadChallenges();
  }, [token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Chargement au changement de tab
  useEffect(() => {
    const fetchChallengesByTab = async () => {
      if (!token || !initialLoadComplete) return;

      if (activeTab === "Challenges en cours" && challengesEnCours.length > 0) {
        setLoadingChallenges(false);
        return;
      }
      if (activeTab === "Challenges à venir" && challengesAvenir.length > 0) {
        setLoadingChallenges(false);
        return;
      }
      if (
        activeTab === "Challenges terminés" &&
        challengesTermines.length > 0
      ) {
        setLoadingChallenges(false);
        return;
      }

      setLoadingChallenges(true);
      try {
        if (activeTab === "Challenges terminés") {
          const res = await apiFetch("/challenges/end", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesTermines(res.challenges_termines || []);
            setVillesTermines(res.villes || ["Partout"]);
          }
        } else if (activeTab === "Challenges à venir") {
          const res = await apiFetch("/challenges/avenir", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesAvenir(res.challenges_avenir || []);
            setVillesAvenir(res.villes || ["Partout"]);
          }
        }
      } catch (error) {
        console.error("Erreur chargement tab:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchChallengesByTab();
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
    if (activeTab === "Challenges en cours") return challengesEnCours;
    if (activeTab === "Challenges terminés") return challengesTermines;
    if (activeTab === "Challenges à venir") return challengesAvenir;
    return [];
  };

  const getCurrentVilles = () => {
    if (activeTab === "Challenges en cours") return villesEnCours;
    if (activeTab === "Challenges à venir") return villesAvenir;
    if (activeTab === "Challenges terminés") return villesTermines;
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
    challengesEnCours,
    challengesTermines,
    challengesAvenir,
  ]);

  const tabs = [
    "Challenges en cours",
    "Challenges à venir",
    "Challenges terminés",
  ];

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
    if (activeTab === "Challenges en cours") {
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
              Il n'y a aucun challenge en cours pour le moment
            </p>
          )}
          <Button
            onClick={() => {
              setActiveTab("Challenges à venir");
              scrollToTab("Challenges à venir");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir les challenges à venir
          </Button>
        </div>
      );
    } else if (activeTab === "Challenges terminés") {
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
              Il n'y a aucun challenge terminé pour le moment
            </p>
          )}
          <Button
            onClick={() => {
              setActiveTab("Challenges à venir");
              scrollToTab("Challenges à venir");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir les challenges à venir
          </Button>
        </div>
      );
    } else if (activeTab === "Challenges à venir") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun challenge à venir
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
              Il n'y a aucun challenge à venir pour le moment
            </p>
          )}
          <Button
            onClick={() => {
              setActiveTab("Challenges en cours");
              scrollToTab("Challenges en cours");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir les challenges en cours
          </Button>
        </div>
      );
    }
    return null;
  };

  const tabsTopPosition = showNavbar ? "top-16" : "top-0";

  // Pour l'insertion des partenaires : on insère après le 3e item (index 2) sur mobile, après la première ligne sur desktop
  // On sépare les challenges en deux parties : avant et après les partenaires
  const SPLIT_INDEX_MOBILE = 4; // après 3 cards sur mobile
  const SPLIT_INDEX_DESKTOP = 4; // après 4 cards sur desktop (première ligne de 4 colonnes)

  const challengesBeforePartners = filteredChallenges.slice(
    0,
    SPLIT_INDEX_MOBILE,
  );
  const challengesAfterPartners = filteredChallenges.slice(SPLIT_INDEX_MOBILE);
  const showPartnersSection =
    activeTab === "Challenges en cours" && !loadingChallenges;

  return (
    <div className="pb-32">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
        animate={{ y: showNavbar ? 0 : -100 }}
      ></motion.div>
      <div className="h-16" />

      {/* Hero Section */}
      <section className="bg-white px-6 py-10 md:py-16 border-b border-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left mb-8 min-h-[100px]"
          >
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              Salut{" "}
              <span className="text-orange-700 capitalize line-clamp-1">
                {userName}
              </span>{" "}
              👋
            </h1>

            <div className="h-12 flex items-start justify-start md:justify-start">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMsgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mt-3 text-base md:text-lg text-gray-600 leading-relaxed flex flex-row justify-center items-start gap-x-1"
                >
                  {welcomeMessages[currentMsgIndex].icon}
                  {welcomeMessages[currentMsgIndex].text}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Titre de section simple */}
          <div className="mb-6">
            <h2 className="text-sm  md:text-xl font-bold flex items-center gap-x-1 ">
              Explorez les challenges disponibles{" "}
              <span className="text-orange-700"> :</span>
            </h2>
            <div className="h-0.5 w-12 mt-1 bg-black" />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
            {/* Challenges en cours */}
            <div
              onClick={() => navigateToTab("Challenges en cours")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.enCours
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Challenges en cours <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Timer size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Challenges à venir */}
            <div
              onClick={() => navigateToTab("Challenges à venir")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.avenir
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Challenges à venir <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Orbit size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Challenges terminés */}
            <div
              onClick={() => navigateToTab("Challenges terminés")}
              className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.termines
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Challenges terminés <ChevronDown size={14} />
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <CheckCircle size={14} className="text-orange-700" />
              </div>
            </div>

            {/* Total challenges */}
            <div className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left transition-all duration-300">
              <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-700" />
                ) : (
                  stats.total
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">
                Total challenges
              </p>
              <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100">
                <Activity size={14} className="text-orange-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section IA avec Loader, Erreur ou Banner */}
      <div className="w-full mb-6">
        {isProfileLoading ? (
          <CoachBannerSkeleton />
        ) : profileError ? (
          /* ÉTAT ERREUR DE CONNEXION */
          <div className="mx-5 md:mx-28 my-8 p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center text-center gap-4 bg-gray-50/30 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <RefreshCw
                size={24}
                className="animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-lg">
                Oups ! Connexion interrompue
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Nous n'avons pas pu charger votre Coach Virtuel. Vérifiez votre
                connexion internet et réessayez.
              </p>
            </div>
            <button
              onClick={fetchInitialData}
              className="px-6 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-100 flex items-center gap-2 active:scale-95"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          </div>
        ) : (
          userProfile && (
            <CoachGeneralBanner
              userName={userName}
              userDomain={userProfile?.domaine_principal?.nom}
              userCompetences={userProfile?.talent?.competences}
            />
          )
        )}
      </div>

      {/* Tabs Sticky */}
      <div
        className={cn(
          "sticky bg-white z-40 shadow transition-all duration-300 md:px-18 mx-auto",
          tabsTopPosition,
        )}
        ref={tabsSectionRef}
      >
        <div
          className="flex overflow-x-auto px-5 pt-3 gap-4 scrollbar-hide"
          ref={tabsContainerRef}
        >
          {tabs.map((tab) => (
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
              {tab}
            </button>
          ))}
        </div>

        {/* Recherche et Filtres */}
        <div className="px-5 pt-3">
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

      {/* Liste des cartes avec insertion partenaires */}
      {loadingChallenges ? (
        <div className="flex py-20 w-full justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
        </div>
      ) : filteredChallenges?.length > 0 ? (
        <>
          {/* Première partie des challenges (avant les partenaires) */}
          <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center max-w-8xl mx-auto">
            {(showPartnersSection
              ? challengesBeforePartners
              : filteredChallenges
            ).map((c: any) => (
              <ChallengeCard key={c.id} challenge={mapChallenge(c)} />
            ))}
          </section>

          {/* Section partenaires (uniquement dans le tab "Challenges en cours") */}
          {showPartnersSection && <PartenairesAccueil token={token} />}

          {/* Suite des challenges (après les partenaires) */}
          {showPartnersSection && challengesAfterPartners.length > 0 && (
            <section className="px-5 mt-2 flex flex-wrap gap-6 justify-center max-w-8xl mx-auto">
              {challengesAfterPartners.map((c: any) => (
                <ChallengeCard key={c.id} challenge={mapChallenge(c)} />
              ))}
            </section>
          )}
        </>
      ) : (
        <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center md:justify-start max-w-8xl mx-auto">
          {renderEmptyState()}
        </section>
      )}

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
