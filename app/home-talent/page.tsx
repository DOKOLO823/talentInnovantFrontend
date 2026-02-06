"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChallengeCard from "../components/ChallengeCard";
import { Activity, ArrowUp, CheckCircle, ChevronDown, Loader2, Orbit, Timer, Sparkles, Rocket, Target, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Challenges en cours");
  const [mesChallengesSubTab, setMesChallengesSubTab] = useState("en_cours");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Partout");
  
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [mesChallengesEnCours, setMesChallengesEnCours] = useState<any[]>([]);
  const [mesChallengesTermines, setMesChallengesTermines] = useState<any[]>([]);
  const [loadingChallengesTermines, setLoadingChallengesTermines] = useState<boolean>(false);
  const [challengesEnCours, setChallengesEnCours] = useState<any[]>([]);
  const [challengesTermines, setChallengesTermines] = useState<any[]>([]);
  const [challengesAvenir, setChallengesAvenir] = useState<any[]>([]);
  const [domaines, setDomaines] = useState<any[]>([]);
  const [villes, setVilles] = useState<string[]>(["Partout"]);
  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  // les lieux des challenges en presentiel ou hybride
  const [villesEnCours, setVillesEnCours] = useState(["Partout"]);
  const [villesAvenir, setVillesAvenir] = useState(["Partout"]);
  const [villesTermines, setVillesTermines] = useState(["Partout"]);

  // --- LOGIQUE MESSAGES ANIMÉS ---
  const welcomeMessages = [
    { text: "Prêt à relever les défis qui feront briller votre talent ?", icon: <Sparkles className="text-orange-500" size={22} /> },
    { text: "Propulsez vos idées et transformez-les en opportunités réelles.", icon: <Rocket className="text-orange-500" size={22} /> },
    { text: "Trouvez le challenge parfait pour booster votre portfolio.", icon: <Target className="text-orange-500" size={22} /> },
    { text: "L'innovation n'attend que vous. Exprimez votre créativité.", icon: <Lightbulb className="text-orange-500" size={22} /> },
    { text: "Devenez le prochain champion de l'innovation technologique.", icon: <Trophy className="text-orange-500" size={22} /> }
  ];
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % welcomeMessages?.length);
    }, 5000); // Change toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);
  
  const [statsUser, setStatsUser] = useState({
    mesChallengesEnCours: 0,
    mesChallengesTermines: 0,
    challengesTotalEnCours: 0,
    challengesAvenir:0
  });

  const { talent, user, loading: authLoading, token } = useAuth();
  const userName = talent?.nom || "";

  const tabsSectionRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/home');
    }
  }, [authLoading, user, router]);

  const scrollToTab = (tabName: string) => {
    if (tabsContainerRef.current) {
      const tabButton = tabsContainerRef.current.querySelector(`button[data-tab="${tabName}"]`);
      if (tabButton) {
        tabButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const navigateToTab = (tab: string, subTab?: string) => {
    setActiveTab(tab);
    if (subTab) {
      setMesChallengesSubTab(subTab);
    }
    setTimeout(() => {
      if (tabsSectionRef.current) {
        const yOffset = showNavbar ? -64 : 0;
        const y = tabsSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      scrollToTab(tab);
    }, 100);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      
      try {
        setLoadingChallenges(true);
        const [homeRes, terminesRes, avenirRes] = await Promise.all([
          apiFetch("/challenges/home", { method: "GET" }),
          apiFetch("/meschallenges/termines", { method: "GET" }),
          apiFetch("/challenges/avenir", { method: "GET" })
        ]);
        
        if (homeRes?.statut === 200) {
          const mesChallenges = homeRes.data.mes_challenges || [];
          const challengesMoment = homeRes.data.challenges_en_cours || [];
          
          setMesChallengesEnCours(mesChallenges);
          setChallengesEnCours(challengesMoment);
          setVilles(homeRes.data.villes || ["Partout"]);
          setVillesEnCours(homeRes.data.villes || ["Partout"])
          
          const allDomaines = new Set<string>();
          [...mesChallenges, ...challengesMoment].forEach((c: any) => {
            if (Array.isArray(c.domaines)) {
              c.domaines.forEach((d: any) => allDomaines.add(d.nom || d.name));
            }
          });
          setDomaines(Array.from(allDomaines));
          
          const mesChallengesTerminesCount = terminesRes?.statut === 200 
            ? (terminesRes.mes_challenges_termines?.length || 0) 
            : 0;

          const challengesAvenirCount = avenirRes?.statut === 200 
            ? (avenirRes?.challenges_avenir?.length || 0) 
            : 0;
          
          setStatsUser({
            mesChallengesEnCours: mesChallenges?.length,
            mesChallengesTermines: mesChallengesTerminesCount,
            challengesTotalEnCours: challengesMoment?.length,
            challengesAvenir:challengesAvenirCount
          });

          if (mesChallenges?.length > 0) {
            setActiveTab("Mes Challenges");
            setMesChallengesSubTab("en_cours");
          } else if (challengesMoment?.length > 0) {
            setActiveTab("Challenges en cours");
          } else {
            setActiveTab("Mes Challenges");
            setMesChallengesSubTab("en_cours");
          }
          
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Erreur chargement initial:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchInitialData();
  }, [token]);

  useEffect(() => {
    const fetchChallengesByTab = async () => {
      if (!token || !initialLoadComplete) return;
      
      setLoadingChallenges(true);
      
      try {
        if (activeTab === "Challenges terminés") {
          const res = await apiFetch("/challenges/end", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesTermines(res.challenges_termines || []);
            setVillesTermines(res.villes);
          }
        } else if (activeTab === "Challenges à venir") {
          const res = await apiFetch("/challenges/avenir", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesAvenir(res.challenges_avenir || []);
            setVillesAvenir(res.villes);
          }
        } else if (activeTab === "Mes Challenges" && mesChallengesSubTab === "termines") {
          setLoadingChallengesTermines(false);
          const res = await apiFetch("/meschallenges/termines", { method: "GET" });
          if (res?.statut === 200) {
            setMesChallengesTermines(res.mes_challenges_termines || []);
            setLoadingChallengesTermines(true);
            setVillesTermines(res.villes);
          }
        } else if (activeTab === "Challenges en cours") {
          const res = await apiFetch("/challenges/home", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesEnCours(res.data.challenges_en_cours || []);
            setVillesEnCours(res.data.villes);
          }
        }
      } catch (error) {
        console.error("Erreur chargement challenges:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    if (activeTab !== "Mes Challenges" || (activeTab === "Mes Challenges" && mesChallengesSubTab === "termines")) {
      fetchChallengesByTab();
    } else {
      setLoadingChallenges(false);
    }
  }, [activeTab, mesChallengesSubTab, token, initialLoadComplete]);

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

  const getCurrentChallenges = () => {
    if (activeTab === "Mes Challenges") {
      return mesChallengesSubTab === "en_cours" ? mesChallengesEnCours : mesChallengesTermines;
    } else if (activeTab === "Challenges en cours") {
      return challengesEnCours;
    } else if (activeTab === "Challenges terminés") {
      return challengesTermines;
    } else if (activeTab === "Challenges à venir") {
      return challengesAvenir;
    }
    return [];
  };

  const filteredChallenges = useMemo(() => {
    let challenges = getCurrentChallenges();

    if (searchQuery.trim()) {
      challenges = challenges?.filter((c: any) =>
        c.titre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDomain && selectedDomain !== "") {
      challenges = challenges?.filter((c: any) => {
        if (Array.isArray(c.domaines)) {
          return c.domaines.some((d: any) => (d.nom || d.name) === selectedDomain);
        }
        return false;
      });
    }

    if (selectedLocation && selectedLocation !== "Partout") {
      challenges = challenges?.filter((c: any) => {
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
  }, [activeTab, mesChallengesSubTab, searchQuery, selectedDomain, selectedLocation, mesChallengesEnCours, mesChallengesTermines, challengesEnCours, challengesTermines, challengesAvenir]);

  // lieux du tab actif 
  const getCurrentVilles = () => {
    switch (activeTab) {
        case "Challenges en cours":
            return villesEnCours;
        case "Challenges à venir":
            return villesAvenir;
        case "Challenges terminés":
            return villesTermines;
        case "Mes Challenges":
            // Si vous êtes dans le sous-onglet "en cours" de "mes challenges"
            return mesChallengesSubTab === "en_cours" ? villesEnCours : villesTermines;
        default:
            return ["Partout"];
    }
};

useEffect(() => {
    setSelectedLocation("Partout"); // Reset le filtre lieu à chaque changement d'onglet
}, [activeTab, mesChallengesSubTab]);

  const tabs = ["Mes Challenges", "Challenges en cours", "Challenges à venir", "Challenges terminés"];

  const renderEmptyState = () => {
    if (activeTab === "Mes Challenges" && mesChallengesSubTab === "en_cours") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">Aucun challenge en cours {searchQuery && <>avec ce mot clé : <span className="font-bold">{searchQuery}</span></> }</p>
         {!searchQuery && <p className="text-gray-500 text-sm mb-6">Vous ne participez à aucun challenge en cours</p> }
          <Button
            onClick={() => {
              setMesChallengesSubTab("termines");
              scrollToTab("Mes Challenges");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes challenges terminés
          </Button>
        </div>
      );
    } else if (activeTab === "Mes Challenges" && mesChallengesSubTab === "termines") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">Aucun challenge terminé {searchQuery && <>avec ce mot clé : <span className="font-bold">{searchQuery}</span></> }</p>
          {!searchQuery && <p className="text-gray-500 text-sm mb-6">Vous n'avez participé à aucun challenge terminé</p> }
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
    } else if (activeTab === "Challenges en cours") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">Aucun challenge en cours {searchQuery && <>avec ce mot clé : <span className="font-bold">{searchQuery}</span></> }</p>
          {!searchQuery && <p className="text-gray-500 text-sm mb-6">Il n'y a aucun challenge en cours pour le moment</p> }
          <Button
            onClick={() => {
              setActiveTab("Challenges terminés");
              scrollToTab("Challenges terminés");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir les challenges terminés
          </Button>
        </div>
      );
    } else if (activeTab === "Challenges terminés") {
      return (
        <div className="text-center w-full py-20">
          <p className="text-gray-600 text-lg font-medium mb-4">Aucun challenge terminé {searchQuery && <>avec ce mot clé : <span className="font-bold">{searchQuery}</span></> }</p>
          {!searchQuery && <p className="text-gray-500 text-sm mb-6">Il n'y a aucun challenge terminé pour le moment</p> }
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
          <p className="text-gray-600 text-lg font-medium mb-4">Aucun challenge à venir {searchQuery && <>avec ce mot clé : <span className="font-bold">{searchQuery}</span></> }</p>
          {!searchQuery && <p className="text-gray-500 text-sm mb-6">Il n'y a aucun challenge à venir pour le moment</p> }
          <Button
            onClick={() => {
              setActiveTab("Mes Challenges");
              setMesChallengesSubTab("en_cours");
              scrollToTab("Mes Challenges");
            }}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Voir mes challenges
          </Button>
        </div>
      );
    }
    return null;
  };

  const tabsTopPosition = showNavbar ? "top-16" : "top-0";

  return (
    <div className="pb-32">
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300" 
        animate={{ y: showNavbar ? 0 : -100 }}
      >
      </motion.div>
      <div className="h-16" />

      {/* Hero Section */}
      <section className="bg-white px-6 py-10 md:py-16 border-b border-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center md:text-left mb-8 min-h-[100px]">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              Hello <span className="text-orange-700 capitalize line-clamp-1">{userName}</span> 👋
            </h1>
            
            {/* ZONE DE MESSAGE ANIMÉE */}
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

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
            <div onClick={() => navigateToTab("Mes Challenges", "en_cours")} className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group">
                <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? <Loader2 className="w-6 h-6 animate-spin text-orange-700" /> : statsUser.mesChallengesEnCours}
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">Mes challenges en cours <ChevronDown size={14}/></p>
                <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100"><Timer size={14} className="text-orange-700" /></div>
            </div>

            <div onClick={() => navigateToTab("Mes Challenges", "termines")} className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group">
                <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? <Loader2 className="w-6 h-6 animate-spin text-orange-700" /> : statsUser.mesChallengesTermines}
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">Mes challenges terminés <ChevronDown size={14}/></p>
                <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100"><CheckCircle size={14} className="text-orange-700" /></div>
            </div>

            <div onClick={() => navigateToTab("Challenges en cours")} className="relative bg-white rounded-xl px-5 pt-5 pb-1 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group">
                <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? <Loader2 className="w-6 h-6 animate-spin text-orange-700" /> : statsUser.challengesTotalEnCours}
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">Total challenges en cours <ChevronDown size={14}/></p>
                <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100"><Activity size={14} className="text-orange-700" /></div>
            </div>

            <div onClick={() => navigateToTab("Challenges à venir")} className="relative bg-white rounded-xl px-5 pt-5 pb-2 shadow-sm border-t-4 border-orange-700 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl group">
                <div className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
                {!initialLoadComplete ? <Loader2 className="w-6 h-6 animate-spin text-orange-700" /> : statsUser.challengesAvenir}
                </div>
                <p className="text-sm font-medium text-gray-500 mt-4 flex flex-col items-center gap-1">Total challenges à venir <ChevronDown size={14}/></p>
                <div className="absolute top-3 right-4 p-2 rounded-full bg-orange-100"><Orbit size={14} className="text-orange-700" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Sticky */}
      <div className={cn("sticky bg-white z-40 shadow transition-all duration-300", tabsTopPosition)} ref={tabsSectionRef}>
        <div className="flex overflow-x-auto px-5 pt-3 gap-4 scrollbar-hide" ref={tabsContainerRef}>
          {tabs.map((tab) => (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Mes Challenges") setMesChallengesSubTab("en_cours");
                scrollToTab(tab);
              }}
              className={cn(
                "pb-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab ? "text-orange-700 border-b-3 border-orange-700 font-semibold" : "text-gray-700 hover:text-orange-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Mes Challenges" && (
          <div className="flex gap-2 px-5 py-3 shadow-sm">
            <button onClick={() => setMesChallengesSubTab("en_cours")} className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-all", mesChallengesSubTab === "en_cours" ? "bg-orange-700 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200")}>
              En cours {initialLoadComplete && '('+mesChallengesEnCours?.length+')'}
            </button>
            <button onClick={() => setMesChallengesSubTab("termines")} className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2", mesChallengesSubTab === "termines" ? "bg-orange-700 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200")}>
              Terminés {loadingChallenges && mesChallengesSubTab === "termines" && <Loader2 className="w-3 h-3 animate-spin" />} {initialLoadComplete && ` (${statsUser?.mesChallengesTermines})`}
            </button>
          </div>
        )}

        {/* Recherche et Filtres */}
        <div className="px-5 pt-3">
          <div className="flex gap-3 items-center overflow-x-auto scrollbar-hide">
            <Input placeholder="Rechercher un challenge par titre..." className="rounded-xl min-w-[250px] max-w-[300px] flex-1" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {domaines?.length > 0 && (
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white min-w-[180px]">
                <option value="">Tous les domaines</option>
                {domaines.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>
        </div>

        {!loadingChallenges ? <div className="px-5 py-3 bg-gradient-to-b from-gray-50/50 to-white ">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {getCurrentVilles()?.map((ville) => (
              <button key={ville} className={cn("px-4 py-1 rounded-full text-sm whitespace-nowrap transition-all", selectedLocation === ville ? "bg-orange-700 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm")} onClick={() => setSelectedLocation(ville)}>
                {ville}
              </button>
            ))}
          </div>
        </div>
        : <div className="px-5 py-3 bg-gradient-to-b from-gray-50/50 to-white">
    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-8 rounded-full bg-gray-200 animate-pulse shrink-0 shadow-sm border border-gray-100"
          style={{
            width: i % 2 === 0 ? "80px" : "110px", // Varie la largeur pour un look plus naturel
          }}
        />
      ))}
    </div>
  </div>
        }
        
      </div>

      {/* Liste des cartes */}
      <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
        {loadingChallenges ? (
          <div className="flex py-20 w-full justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-700" /></div>
        ) : filteredChallenges?.length > 0 ? (
          filteredChallenges?.map((c: any) => {
            const mappedChallenge = {
              id: c.id,
              user_id:c.user_id,
              title: c.titre,
              image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
              locationType: c.lieu || "",
              site: c.site || "",
              startDate: c.datelancement || "",
              endDate: c.datefin || "",
              participants: c.participants_count || 0,
              rewards: (() => {
    let rewardsArray = ["Prix non défini"];
    try {
      if (typeof c.recompense === 'string' && c.recompense !== 'null') {
        const parsed = JSON.parse(c.recompense);
        // Object.values transforme {"0":"Prix 1"} en ["Prix 1"]
        rewardsArray = Object.values(parsed);
      } else if (Array.isArray(c.recompense)) {
        rewardsArray = c.recompense;
      }
    } catch (e) {
      console.error("Erreur parsing récompenses:", e);
    }
    return rewardsArray;
  })(),
              categories: Array.isArray(c.domaines) ? c.domaines.map((d: any) => d.nom || d.name) : ["Innovation"],
              inscriptionEnd: c.datefininscription || "Bientôt",
              entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
              entrepriseLogo: c.user?.pp ? `${apifile}/${c.user.pp}` : "../assets/images/ppe.png",
              entrepriseId: c.user_id
            };
            return <ChallengeCard key={c.id} challenge={mappedChallenge} />;
          })
        ) : renderEmptyState()}
      </section>

      {showBackToTop && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={scrollToTop} className="fixed bottom-24 right-5 z-50 p-3 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800">
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}