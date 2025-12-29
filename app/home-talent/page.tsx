"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChallengeCard from "../components/ChallengeCard";
import Image from "next/image";
import { ArrowRight, Search, ArrowUp, MapPin, Briefcase, Loader2 } from "lucide-react"; 
import { cn } from "@/lib/utils";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import BottomBar from "../components/BottomBar";
import FiltreChallenge from "../components/recherche/FiltreChallenge";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Challenges du moment");
  const [mesChallengesSubTab, setMesChallengesSubTab] = useState("en_cours"); // en_cours | termines
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Partout");
  const [selectedDomain, setSelectedDomain] = useState("");
  
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // --- ETATS POUR L'INTEGRATION ---
  const [innovators, setInnovators] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  // --- NOUVEAUX ÉTATS POUR LES CHALLENGES ---
  const [mesChallengesEnCours, setMesChallengesEnCours] = useState<any[]>([]);
  const [mesChallengesTermines, setMesChallengesTermines] = useState<any[]>([]);
  const [challengesEnCours, setChallengesEnCours] = useState<any[]>([]);
  const [challengesTermines, setChallengesTermines] = useState<any[]>([]);
  const [challengesAvenir, setChallengesAvenir] = useState<any[]>([]);
  const [villes, setVilles] = useState<string[]>(["Partout"]);
  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [nombreMesChallenges, setNombreMesChallenges] = useState(0);
  const [nombreChallengesTotal, setNombreChallengesTotal] = useState(0);

  const { talent, user, loading: authLoading, token } = useAuth();
  const userName = talent?.nom || "";

  const tabsSectionRef = useRef<HTMLDivElement>(null);
  const NAVBAR_HEIGHT = 64; 
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/home');
    }
  }, [authLoading, user, router]);
  

  // --- CHARGEMENT INITIAL (Mes Challenges + Challenges du moment + Villes) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      
      try {
        setLoadingChallenges(true);
        const res = await apiFetch("/challenges/home", { method: "GET" });
        
        if (res?.statut === 200) {
          setMesChallengesEnCours(res.data.mes_challenges || []);
          setChallengesEnCours(res.data.challenges_en_cours || []);
          setVilles(res.data.villes || ["Partout"]);
          setNombreMesChallenges(res.data.mes_challenges?.length || 0);
          setNombreChallengesTotal(res.data.challenges_en_cours?.length || 0);
        }
      } catch (error) {
        console.error("Erreur chargement initial:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // --- CHARGEMENT DES CHALLENGES SELON L'ONGLET ACTIF ---
  useEffect(() => {
    const fetchChallengesByTab = async () => {
      if (!token) return;
      
      setLoadingChallenges(true);
      
      try {
        if (activeTab === "Challenges terminés") {
          const res = await apiFetch("/challenges/end", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesTermines(res.challenges_termines || []);
          }
        } else if (activeTab === "Challenges à venir") {
          const res = await apiFetch("/challenges/avenir", { method: "GET" });
          if (res?.statut === 200) {
            setChallengesAvenir(res.challenges_avenir || []);
          }
        } else if (activeTab === "Mes Challenges" && mesChallengesSubTab === "termines") {
          const res = await apiFetch("/meschallenges/termines", { method: "GET" });
          if (res?.statut === 200) {
            setMesChallengesTermines(res.mes_challenges_termines || []);
          }
        } else if (activeTab === "Challenges du moment") {
           // On recharge pour s'assurer de la fraîcheur des données
           const res = await apiFetch("/challenges/home", { method: "GET" });
           if (res?.statut === 200) {
             setChallengesEnCours(res.data.challenges_en_cours || []);
           }
        }
      } catch (error) {
        console.error("Erreur chargement challenges:", error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    // Déclenchement du loader et fetch
    if (token) {
        fetchChallengesByTab();
    }
    
  }, [activeTab, mesChallengesSubTab, token]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoadingTrends(true);
        const [talentsRes, companiesRes] = await Promise.all([
          apiFetch("/talents/top", { method: "GET" }),
          apiFetch("/entreprises/top", { method: "GET" })
        ]);

        if (talentsRes?.statut === 200) {
          const mappedTalents = talentsRes.top10.map((t: any) => ({
            id: t.id,
            name: `${t.nom} ${t.prenom || ""}`,
            points: t.point || 0,
            profession: t.profession || "Innovateur",
            avatar: t.user?.pp ? `${apifile}/${t.user.pp}` : "/assets/images/innov.jpg",
          }));
          setInnovators(mappedTalents);
        }

        if (companiesRes?.statut === 200) {
          setCompanies(companiesRes.top10);
        }
      } catch (error) {
        console.error("Erreur tendances:", error);
      } finally {
        setLoadingTrends(false);
      }
    };

    if (token) fetchTrends();
  }, [token]);

  const handleToggleAbonnement = async (e: React.MouseEvent, entrepriseId: number) => {
    e.stopPropagation();
    if (isToggling) return;

    try {
      setIsToggling(entrepriseId);
      const res = await apiFetch('/entreprise/abonnement/toggle', {
        method: 'POST',
        body: JSON.stringify({ entreprise_id: entrepriseId })
      });

      if (res.statut === 200) {
        setCompanies(prev => prev.map(c => 
          c.id === entrepriseId ? { ...c, is_abonne: res.abonne } : c
        ));
      }
    } catch (err) {
      console.error("Erreur toggle:", err);
    } finally {
      setIsToggling(null);
    }
  };

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

  const handleScrollToTabs = (targetTab: string) => {
   if(nombreMesChallenges == 0 && targetTab === "Mes Challenges"){ 
    return;
   }

    setActiveTab(targetTab);
    if (tabsSectionRef.current) { 
      const targetPosition = tabsSectionRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetPosition - NAVBAR_HEIGHT, behavior: "smooth" });
    }

  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const getCurrentChallenges = () => {
    if (activeTab === "Mes Challenges") {
      return mesChallengesSubTab === "en_cours" ? mesChallengesEnCours : mesChallengesTermines;
    } else if (activeTab === "Challenges du moment") {
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
      challenges = challenges.filter((c: any) => 
        c.titre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
  }, [activeTab, mesChallengesSubTab, searchQuery, selectedLocation, mesChallengesEnCours, mesChallengesTermines, challengesEnCours, challengesTermines, challengesAvenir]);

  const showMesChallengesTab = nombreMesChallenges > 0;

  const tabs = showMesChallengesTab 
    ? ["Mes Challenges", "Challenges du moment", "Challenges terminés", "Challenges à venir"]
    : ["Challenges du moment", "Challenges terminés", "Challenges à venir"];

  return (
    <div className="pb-32">
      <motion.div className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300" animate={{ y: showNavbar ? 0 : -100 }}>
        <Navbar />
      </motion.div>
      <div className="h-16" /> 

      {/* Hero Section */}
      <section className="bg-white px-6 py-10 md:py-20 border-b border-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Hello <span className="text-orange-700">{userName},</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
              Découvrez, participez et brillez à travers les meilleurs challenges d'innovation au Cameroun.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center md:justify-start">
             
                <Button 
                  className="bg-orange-700 hover:bg-orange-800 text-white rounded-lg px-6 md:px-12 py-2.5 text-sm md:text-base font-medium transition-colors shadow-sm min-w-[160px] flex items-center justify-center gap-2"
                  onClick={() => handleScrollToTabs("Mes Challenges")}
                >
                  Mes Challenges 
                   <span className="text-white flex items-center gap-1">
                  {loadingChallenges ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `(${nombreMesChallenges})`
                  )}
                </span>

                </Button>
             
              <Button 
                variant="outline" 
                className="group border-orange-700 text-orange-700 hover:border-orange-600 hover:text-orange-700 rounded-lg px-6 md:px-12 py-2.5 text-sm md:text-base font-medium transition-all min-w-[160px] flex items-center justify-center gap-2" 
                onClick={() => handleScrollToTabs("Challenges du moment")}
              >
                Découvrir les challenges 
                <span className="text-orange-600 flex items-center gap-1">
                  {loadingChallenges ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    nombreChallengesTotal > 0 && `(${nombreChallengesTotal})`
                  )}
                </span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
          <div className="flex-1 w-full max-w-md hidden md:block">
            <Image src="/assets/images/innov.jpg" alt="Innovation Hub" width={500} height={350} className="rounded-lg object-cover shadow-sm border border-gray-100" priority />
          </div>
        </div>
      </section>

      <FiltreChallenge/>

      {/* Innovateurs en tendances */}
      <section className="mt-12 px-5">
        <h2 className="text md:text-xl font-semibold mb-3">Innovateurs en tendances</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {loadingTrends ? (
             <div className="flex py-10 w-full justify-center"><Loader2 className="animate-spin text-orange-700" /></div>
          ) : innovators.map((i) => (
            <div 
              key={i.id} 
              onClick={() => router.push(`/profil-talent/${i.id}`)}
              className="flex-shrink-0 w-48 snap-center cursor-pointer transition-transform active:scale-95"
            >
              <div className="bg-white shadow-sm rounded-xl p-3 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <img src={i.avatar} alt={i.name} className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-orange-50" />
                <p className="font-semibold mt-2 text-sm truncate">{i.name}</p>
                <span className="text-[10px] text-gray-500 block truncate">{i.profession}</span>
                <p className="text-xs text-orange-700 font-bold mt-1">{i.points} pts</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Entreprises en tendances */}
      <section className="mt-12 px-5">
        <h2 className="text md:text-xl font-semibold mb-3">Entreprises en tendances</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {loadingTrends ? (
             <div className="flex py-10 w-full justify-center"><Loader2 className="animate-spin text-orange-700" /></div>
          ) : companies.map((c) => (
            <div key={c.id} className="flex-shrink-0 w-48 snap-center">
              <div className="bg-white shadow-sm rounded-xl p-3 text-center border border-gray-100">
                <div 
                  className="cursor-pointer"
                  onClick={() => router.push(`/profil-entreprise/${c.id}`)}
                >
                  <img 
                    src={c.user?.pp ? `${apifile}/${c.user.pp}` : "/assets/images/orange.png"} 
                    alt={c.nom} 
                    className="w-14 h-14 rounded-full mx-auto object-cover" 
                  />
                  <p className="font-semibold mt-2 text-sm truncate">{c.nom}</p>
                  <p className="text-xs text-gray-500 mb-2">{c.point || 0} pts</p>
                </div>
                
                <Button 
                  onClick={(e) => handleToggleAbonnement(e, c.id)}
                  disabled={isToggling === c.id}
                  className={cn(
                    "w-full h-8 text-[10px] transition-all",
                    c.is_abonne 
                      ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200" 
                      : "bg-orange-700 hover:bg-orange-600 text-white"
                  )}
                >
                  {isToggling === c.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    c.is_abonne ? "Se désabonner" : "S'abonner"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TABS (Onglets) */}
      <div className="sticky top-0 bg-white z-40 mt-10 border-b" ref={tabsSectionRef}>
        <div className="flex overflow-x-auto px-5 pt-3 gap-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Mes Challenges") setMesChallengesSubTab("en_cours");
              }} 
              className={cn(
                "pb-3 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab 
                  ? "text-orange-700 border-b-3 border-orange-700 font-semibold" 
                  : "text-gray-700 hover:text-orange-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SOUS-TABS POUR MES CHALLENGES */}
        {activeTab === "Mes Challenges" && (
          <div className="flex gap-2 px-5 py-3 bg-orange-50/30">
            <button
              onClick={() => setMesChallengesSubTab("en_cours")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                mesChallengesSubTab === "en_cours"
                  ? "bg-orange-700 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              En cours ({mesChallengesEnCours.length})
            </button>
            <button
              onClick={() => setMesChallengesSubTab("termines")}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                mesChallengesSubTab === "termines"
                  ? "bg-orange-700 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              Terminés ({mesChallengesTermines.length})
            </button>
          </div>
        )}
      </div>

      {/* RECHERCHE LOCALE */}
      <div className="px-5 pt-5 sticky top-[40px] bg-white z-30 shadow-md pb-0.5">
        <Input 
          placeholder={`Rechercher un challenge par titre...`}
          className="rounded-xl w-full md:w-1/3" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide mb-3">
          {villes.map((ville) => (
            <button 
              key={ville} 
              className={cn(
                "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all",
                selectedLocation === ville 
                  ? "bg-orange-700 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )} 
              onClick={() => setSelectedLocation(ville)}
            >
              {ville}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE CHALLENGES */}
      <section className="px-5 mt-6 flex flex-wrap gap-6 justify-center md:justify-start">
        {loadingChallenges ? (
          <div className="flex py-20 w-full justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
          </div>
        ) : filteredChallenges.length > 0 ? (
          filteredChallenges.map((c: any) => {
            const rewardsArray = c.recompense 
              ? Object.entries(c.recompense).map(([key, value]) => `${key.replace('_', ' ')} : ${value}`)
              : [];

            const categoriesArray = Array.isArray(c.domaines) 
              ? c.domaines.map((d: any) => d.nom || d.name) 
              : [];

            const mappedChallenge = {
              id: c.id,
              title: c.titre,
              image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
              locationType: c.lieu || "Non spécifié",
              site: c.ville || "Cameroun",
              startDate: c.datelancement ? new Date(c.datelancement).toLocaleDateString() : "À venir",
              endDate: c.datefin ? new Date(c.datefin).toLocaleDateString() : "Non définie",
              participants: c.participants_count || 0,
              rewards: rewardsArray,
              categories: categoriesArray.length > 0 ? categoriesArray : ["Innovation"],
              inscriptionEnd: c.datefininscription 
                ? new Date(c.datefininscription).toLocaleDateString() 
                : "Bientôt",
              entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
              entrepriseLogo: c.user?.pp ? `${apifile}/${c.user.pp}` : "/default-avatar.jpg",
              entrepriseId: c.user_id
            };

            return <ChallengeCard key={c.id} challenge={mappedChallenge} />;
          })
        ) : (
          <div className="text-center w-full py-20">
            <p className="text-gray-500 text-lg">Aucun challenge trouvé.</p>
            <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </section>

      {showBackToTop && (
        <motion.button 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          onClick={scrollToTop} 
          className="fixed bottom-24 right-5 z-50 p-3 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}

      <BottomBar/>
    </div>
  );
}