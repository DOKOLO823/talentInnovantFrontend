"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import ChallengeCard from "../components/ChallengeCard";
import PartenairesAccueil from "./components/PartenairesAccueil";
import ChallengeSearchBox from "../components/recherche/ChallengeSearchBox";
import { ChallengeSkeletonCards } from "../components/ChallengeSkeleton";
import {
  ArrowUp,
  ChevronsDown,
  Loader2,
  RotateCcw,
  Sparkles,
  Rocket,
  Target,
  Lightbulb,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import { mapChallengeToCard } from "@/app/lib/mapChallengeCard";

// --- Onglets : route + clé de la réponse ---
const TABS = [
  "Challenges en cours",
  "Challenges à venir",
  "Challenges terminés",
] as const;

const TAB_API: Record<string, { url: string; key: string }> = {
  "Challenges en cours": {
    url: "/challenges/en-cours",
    key: "challenges_en_cours",
  },
  "Challenges à venir": {
    url: "/challenges/avenir",
    key: "challenges_avenir",
  },
  "Challenges terminés": {
    url: "/challenges/end",
    key: "challenges_termines",
  },
};

type ListState = {
  items: any[];
  page: number;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean; // chargement de la page 1 (skeletons)
  loadingMore: boolean; // "charger plus"
  error: boolean;
};

const EMPTY_LIST: ListState = {
  items: [],
  page: 0,
  hasMore: false,
  loaded: false,
  loading: false,
  loadingMore: false,
  error: false,
};

// Une liste par couple (onglet, tri) : on garde ce qui est déjà chargé
const listKey = (tab: string, tri: string) => `${tab}|${tri}`;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("Challenges en cours");
  const [tri, setTri] = useState<"recents" | "populaires">("recents");
  const [lists, setLists] = useState<Record<string, ListState>>({});
  const [counts, setCounts] = useState<{
    enCours: number;
    avenir: number;
    termines: number;
  } | null>(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // --- CHARGEMENT D'UNE PAGE (20 challenges) D'UN ONGLET ---
  const loadList = useCallback(
    async (tab: string, triValue: string, page: number) => {
      const k = listKey(tab, triValue);

      setLists((prev) => ({
        ...prev,
        [k]: {
          ...(prev[k] ?? EMPTY_LIST),
          loading: page === 1,
          loadingMore: page > 1,
          error: false,
        },
      }));

      try {
        const cfg = TAB_API[tab];
        const res = await apiFetch(`${cfg.url}?page=${page}&tri=${triValue}`, {
          method: "GET",
        });

        if (res?.statut !== 200) throw new Error("statut");

        const incoming: any[] = res[cfg.key] || [];

        setLists((prev) => {
          const cur = prev[k] ?? EMPTY_LIST;
          const ids = new Set(cur.items.map((c) => c.id));
          return {
            ...prev,
            [k]: {
              items:
                page === 1
                  ? incoming
                  : [...cur.items, ...incoming.filter((c) => !ids.has(c.id))],
              page,
              hasMore: !!res.has_more,
              loaded: true,
              loading: false,
              loadingMore: false,
              error: false,
            },
          };
        });
      } catch (error) {
        console.error("Erreur chargement challenges:", error);
        setLists((prev) => ({
          ...prev,
          [k]: {
            ...(prev[k] ?? EMPTY_LIST),
            loading: false,
            loadingMore: false,
            error: true,
          },
        }));
      }
    },
    [],
  );

  // Compteurs des 3 onglets (une requête légère)
  useEffect(() => {
    if (!token) return;
    apiFetch("/challenges/compteurs", { method: "GET" })
      .then((res: any) => {
        if (res?.statut === 200) {
          setCounts({
            enCours: res.en_cours,
            avenir: res.avenir,
            termines: res.termines,
          });
        }
      })
      .catch(() => {});
  }, [token]);

  // Charge la liste de l'onglet / du tri actif si elle n'a pas encore été chargée
  const listsRef = useRef(lists);
  listsRef.current = lists;

  useEffect(() => {
    if (!token) return;
    const cur = listsRef.current[listKey(activeTab, tri)];
    if (!cur || (!cur.loaded && !cur.loading && !cur.error)) {
      loadList(activeTab, tri, 1);
    }
  }, [token, activeTab, tri, loadList]);

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const current = lists[listKey(activeTab, tri)] ?? EMPTY_LIST;
  const isInitialLoading =
    !current.error &&
    (!current.loaded || current.loading) &&
    current.items.length === 0;

  const countFor = (tab: string) => {
    if (!counts) return null;
    if (tab === "Challenges en cours") return counts.enCours;
    if (tab === "Challenges à venir") return counts.avenir;
    return counts.termines;
  };

  const renderEmptyState = () => {
    const config: Record<
      string,
      { title: string; text: string; cta: string; to: string }
    > = {
      "Challenges en cours": {
        title: "Aucun challenge en cours",
        text: "Il n'y a aucun challenge en cours pour le moment",
        cta: "Voir les challenges à venir",
        to: "Challenges à venir",
      },
      "Challenges terminés": {
        title: "Aucun challenge terminé",
        text: "Il n'y a aucun challenge terminé pour le moment",
        cta: "Voir les challenges à venir",
        to: "Challenges à venir",
      },
      "Challenges à venir": {
        title: "Aucun challenge à venir",
        text: "Il n'y a aucun challenge à venir pour le moment",
        cta: "Voir les challenges en cours",
        to: "Challenges en cours",
      },
    };
    const c = config[activeTab];
    return (
      <div className="text-center w-full py-20">
        <p className="text-gray-600 text-lg font-medium mb-4">{c.title}</p>
        <p className="text-gray-500 text-sm mb-6">{c.text}</p>
        <Button
          onClick={() => {
            setActiveTab(c.to);
            scrollToTab(c.to);
          }}
          className="bg-orange-700 hover:bg-orange-800 text-white"
        >
          {c.cta}
        </Button>
      </div>
    );
  };

  const tabsTopPosition = showNavbar ? "top-16" : "top-0";

  // Insertion des partenaires après les 4 premiers challenges (onglet "en cours")
  const SPLIT_INDEX = 4;
  const showPartnersSection =
    activeTab === "Challenges en cours" && !isInitialLoading;
  const challengesBeforePartners = current.items.slice(0, SPLIT_INDEX);
  const challengesAfterPartners = current.items.slice(SPLIT_INDEX);

  return (
    <div className="pb-32">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
        animate={{ y: showNavbar ? 0 : -100 }}
      ></motion.div>
      <div className="h-16" />

      {/* Hero : salutation + zone de recherche */}
      <section className="bg-white px-5 sm:px-6 py-10 md:py-16 border-b border-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 min-h-[100px] flex flex-col items-center"
          >
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              Hello{" "}
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

          {/* Rechercher un challenge (centré) */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-base md:text-xl font-bold text-gray-900 mb-4">
              Rechercher un challenge
            </h2>
            <ChallengeSearchBox />
          </div>
        </div>
      </section>

      {/* Titre de section */}
      <div className="px-5 sm:px-6 pt-10 max-w-7xl mx-auto">
        <h2 className="text-sm md:text-xl font-bold flex items-center gap-x-1">
          Explorer les challenges :
        </h2>
        <div className="h-0.5 w-12 mt-1 bg-black" />
      </div>

      {/* Onglets (sticky) avec compteurs */}
      <div
        className={cn(
          "sticky bg-white z-40 shadow max-w-7xl mx-auto md:px-8 lg:px-12 mt-4 transition-all duration-300",
          tabsTopPosition,
        )}
      >
        <div
          className="flex overflow-x-auto px-5 pt-3 gap-5 scrollbar-hide"
          ref={tabsContainerRef}
        >
          {TABS.map((tab) => {
            const n = countFor(tab);
            return (
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
                {n !== null && (
                  <span className="ml-1 font-semibold">({n})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tri */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 lg:px-12 mt-4 flex items-center justify-end gap-2">
        <label
          htmlFor="tri-challenges"
          className="text-sm text-gray-600 font-medium"
        >
          Trier par :
        </label>
        <select
          id="tri-challenges"
          value={tri}
          onChange={(e) => setTri(e.target.value as "recents" | "populaires")}
          className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        >
          <option value="recents">Les plus récents</option>
          <option value="populaires">Les plus populaires</option>
        </select>
      </div>

      {/* Liste */}
      {isInitialLoading ? (
        <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center max-w-8xl mx-auto">
          <ChallengeSkeletonCards count={8} />
        </section>
      ) : current.error && current.items.length === 0 ? (
        <section className="px-5 mt-6 text-center py-16">
          <p className="text-gray-500 mb-4">
            Impossible de charger les challenges.
          </p>
          <button
            onClick={() => loadList(activeTab, tri, 1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 active:scale-95 transition-all"
          >
            <RotateCcw size={18} /> Réessayer
          </button>
        </section>
      ) : current.items.length > 0 ? (
        <>
          <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center max-w-8xl mx-auto">
            {(showPartnersSection
              ? challengesBeforePartners
              : current.items
            ).map((c: any) => (
              <ChallengeCard key={c.id} challenge={mapChallengeToCard(c)} />
            ))}
          </section>

          {/* Partenaires (uniquement dans l'onglet "Challenges en cours") */}
          {showPartnersSection && <PartenairesAccueil token={token} />}

          {showPartnersSection && challengesAfterPartners.length > 0 && (
            <section className="px-5 mt-2 flex flex-wrap gap-6 justify-center max-w-8xl mx-auto">
              {challengesAfterPartners.map((c: any) => (
                <ChallengeCard key={c.id} challenge={mapChallengeToCard(c)} />
              ))}
            </section>
          )}

          {/* Charger plus / fin de liste */}
          <div className="flex flex-col items-center mt-10 px-5">
            {current.hasMore ? (
              <button
                onClick={() => loadList(activeTab, tri, current.page + 1)}
                disabled={current.loadingMore}
                className="flex items-center text-sm md:text-base gap-2 px-4 py-2 md:px-8 md:py-3 bg-white text-orange-700 border border-orange-700 rounded-xl font-bold hover:bg-orange-700 hover:text-white active:scale-95 transition-all disabled:opacity-70"
              >
                {current.loadingMore ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Chargement...
                  </>
                ) : (
                  <>
                    <ChevronsDown className="h-5 w-5" /> Charger plus de
                    challenges
                  </>
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                C'est tout pour le moment : vous avez vu tous les {activeTab}.
              </p>
            )}
          </div>
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
