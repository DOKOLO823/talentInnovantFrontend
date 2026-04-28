// app/communaute/CommunautePage.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChallengeCard from "../components/ChallengeCard";
import {
  Trophy,
  Target,
  Award,
  TrendingUp,
  Users,
  Building2,
  Crown,
  Medal,
  Star,
  User,
  ArrowRight,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  Activity,
  CheckCircle,
  ChevronDown,
  Loader2,
  Timer,
  Orbit,
  Plus,
  Settings,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../components/BackButton";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import TalentChallengeTypeModal from "./components/TalentChallengeTypeModal";

// ── Skeletons ──
const PerformanceSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <div className="w-14 h-14 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-5 border border-gray-200 h-32"
        />
      ))}
    </div>
    <div className="bg-white rounded-xl p-6 border border-gray-200 h-24" />
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 w-64 sm:w-72 flex-shrink-0 animate-pulse">
    <div className="flex justify-end mb-4">
      <div className="w-20 h-6 bg-gray-100 rounded-full" />
    </div>
    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto mb-6" />
    <div className="h-10 bg-gray-200 rounded-xl w-full" />
  </div>
);

const ConnectionError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="bg-orange-50 p-4 rounded-full mb-4">
      <WifiOff className="w-8 h-8 text-orange-700" />
    </div>
    <h3 className="text-gray-900 font-bold text-lg">Connexion instable</h3>
    <p className="text-gray-500 text-sm max-w-[280px] mt-2 mb-6">
      Vérifiez votre connexion internet et réessayez.
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-orange-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
    >
      <RefreshCw className="w-4 h-4" /> Actualiser
    </button>
  </div>
);

// ── Tab Classement ──
function TabClassement() {
  const [stats, setStats] = useState<any>(null);
  const [innovators, setInnovators] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingInnovators, setLoadingInnovators] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const res = await apiFetch("/talent/statistiques", { method: "GET" });
      if (res?.statut === 200) setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchInnovators = async () => {
    if (!token) return;
    try {
      setLoadingInnovators(true);
      const res = await apiFetch("/talents/top", { method: "GET" });
      if (res?.statut === 200) {
        setInnovators(
          res?.top100?.map((t: any) => ({
            id: t.user_id,
            name: `${t.nom} ${t.prenom || ""}`,
            points: t.point || 0,
            rang: t.rang,
            profession: t.profession || "Innovateur",
            nombre_projets:
              t.nombre_projets ?? (t.user?.challengeposts_count || 0),
            avatar: t.user?.pp
              ? `${apifile}/${t.user.pp}`
              : "/assets/images/pp2.png",
          })),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInnovators(false);
    }
  };

  const fetchCompanies = async () => {
    if (!token) return;
    try {
      setLoadingCompanies(true);
      const res = await apiFetch("/entreprises/top", { method: "GET" });
      if (res?.statut === 200) setCompanies(res.top100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchInnovators();
    fetchCompanies();
  }, [token]);

  const calculateProgress = () => {
    if (!stats?.nombre_talents || !stats?.rang) return 0;
    const currentRang = parseInt(stats.rang.replace(/\D/g, ""));
    const total = stats.nombre_talents;
    if (total <= 1) return 100;
    return Math.min(
      100,
      Math.max(0, Math.round(((total - currentRang + 1) / total) * 100)),
    );
  };

  return (
    <div className="space-y-10">
      {/* Performances */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-5 h-5 text-orange-700" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Mes Performances
          </h2>
        </div>
        {loadingStats ? (
          <PerformanceSkeleton />
        ) : stats ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-6 w-full md:w-fit"
            >
              <Link
                href={`/profil-talent/${stats?.user?.id}`}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  <img
                    src={
                      stats?.user?.pp
                        ? `${apifile}/${stats.user.pp}`
                        : "/assets/images/pp2.png"
                    }
                    alt="photo"
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-100 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight line-clamp-1">
                    {stats?.talent?.nom}
                  </h3>
                  {stats.talent?.profession && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {stats.talent.profession.substring(0, 25)}
                      {stats.talent.profession.length > 25 ? "..." : ""}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                {
                  icon: Trophy,
                  label: "Rang sur Talent Innovant",
                  value: `${stats.rang} / ${stats.nombre_talents}`,
                  small: stats?.rang?.includes("ex-"),
                },
                { icon: Award, label: "Points", value: stats.points },
                {
                  icon: Target,
                  label: "Challenges participés",
                  value: stats.nombre_challenges,
                },
                {
                  icon: TrendingUp,
                  label: "Projets soumis",
                  value: stats.nombre_projets,
                },
              ].map(({ icon: Icon, label, value, small }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto">
                    <Icon className="w-5 h-5 text-orange-700" />
                  </div>
                  <div
                    className={`${small ? "text-sm" : "text-2xl sm:text-3xl"} font-bold text-orange-700 mb-1`}
                  >
                    {value}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Votre taux de progression
                </h3>
                <span className="text-orange-700 font-bold text-sm">
                  {calculateProgress()}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="h-full bg-orange-700"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed italic mt-3">
                {stats.rang === "1er"
                  ? "Félicitations ! Vous êtes au sommet."
                  : "Continuez de participer aux challenges pour gravir les échelons !"}
              </p>
            </div>
          </>
        ) : (
          <ConnectionError onRetry={fetchStats} />
        )}
      </section>

      {/* Innovateurs */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-orange-700" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Les talents les plus actifs
          </h2>
        </div>
        {loadingInnovators ? (
          <div className="flex gap-4 overflow-x-hidden pb-4">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : innovators?.length > 0 ? (
          <>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {innovators.map((inv, index) => {
                const SpecialIcon =
                  index === 0
                    ? Crown
                    : index === 1
                      ? Medal
                      : index === 2
                        ? Star
                        : null;
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative flex-shrink-0 w-64 sm:w-72"
                  >
                    {inv.nombre_projets > 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100">
                          {inv.nombre_projets} Projet(s)
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <Link
                        href={`/profil-talent/${inv.id}`}
                        className="relative inline-block mb-4"
                      >
                        <img
                          src={inv.avatar}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-orange-100 transition-all"
                          alt={inv.name}
                        />
                        {SpecialIcon && (
                          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
                            <SpecialIcon className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                      </Link>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-orange-700">
                        {inv.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 font-medium h-5 truncate">
                        {inv.profession}
                      </p>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-bold text-orange-700">
                            {inv.points} pts
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                          {inv.rang}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/profil-talent/${inv.id}`)}
                        className="w-full hover:bg-orange-700 text-orange-700 border border-orange-700 hover:text-white font-semibold rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Voir le profil</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push("/communaute/talents")}
                className="bg-white py-3 text-sm text-orange-700 border border-orange-200 hover:bg-orange-50 font-bold rounded-xl px-8"
              >
                Voir tous les talents{" "}
                <ArrowRight className="w-4 h-4 inline-block ml-1" />
              </button>
            </div>
          </>
        ) : (
          <ConnectionError onRetry={fetchInnovators} />
        )}
      </section>

      {/* Entreprises */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-orange-700" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Les entreprises les plus actives
          </h2>
        </div>
        {loadingCompanies ? (
          <div className="flex gap-4 overflow-x-hidden pb-4">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : companies?.length > 0 ? (
          <>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
              {companies.map((company, index) => {
                const rankColor =
                  index === 0
                    ? "text-yellow-700 bg-yellow-50 border-yellow-100"
                    : index === 1
                      ? "text-slate-500 bg-slate-50 border-slate-100"
                      : "text-orange-600 bg-orange-50 border-orange-100";
                return (
                  <motion.div
                    key={company.id}
                    className="flex-shrink-0 w-64 sm:w-72 snap-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col"
                  >
                    <div className="flex justify-end mb-4">
                      <span className="text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-100">
                        {company.nombre_challenges || 0} Challenge(s)
                      </span>
                    </div>
                    <div
                      className="cursor-pointer text-center"
                      onClick={() =>
                        router.push(`/profil-entreprise/${company?.user_id}`)
                      }
                    >
                      <img
                        src={
                          company.user?.pp
                            ? `${apifile}/${company.user.pp}`
                            : "/assets/images/ppe.png"
                        }
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto object-cover shadow-lg border-4 border-white mb-4"
                        alt={company.nom}
                      />
                      <h3 className="font-bold text-gray-900 mb-1 truncate text-base sm:text-lg flex items-center justify-center gap-1.5">
                        {company.nom}
                        {company?.user?.certifie ? (
                          <CheckCircle2 className="w-4 h-4 text-orange-700 fill-orange-700/10 flex-shrink-0" />
                        ) : (
                          ""
                        )}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-xs font-semibold text-gray-400">
                          {company.point || 0} pts
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${rankColor}`}
                        >
                          {company.rang}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/profil-entreprise/${company?.user_id}`)
                      }
                      className="w-full font-bold rounded-xl py-2.5 bg-orange-700 hover:bg-orange-800 text-white shadow-orange-100 shadow-lg text-sm"
                    >
                      Voir l'entreprise
                    </button>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push("/communaute/entreprises")}
                className="bg-white py-3 text-sm text-orange-700 border border-orange-200 hover:bg-orange-50 font-bold rounded-xl px-8"
              >
                Voir toutes les entreprises{" "}
                <ArrowRight className="w-4 h-4 inline-block ml-1" />
              </button>
            </div>
          </>
        ) : (
          <ConnectionError onRetry={fetchCompanies} />
        )}
      </section>
    </div>
  );
}

// ── Tab Challenges Talents ──
function TabChallengesTalents() {
  const [activeSubTab, setActiveSubTab] = useState("en_cours");
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

  const { token } = useAuth();
  const router = useRouter();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const subTabs = [
    {
      key: "en_cours",
      label: "Challenges en cours",
      description:
        "Les challenges créés ou publiés par des talents et actuellement ouverts.",
    },
    {
      key: "avenir",
      label: "Challenges à venir",
      description:
        "Les challenges créés par des talents qui n'ont pas encore démarré.",
    },
    {
      key: "termines",
      label: "Challenges terminés",
      description:
        "Les challenges créés par des talents qui sont maintenant clôturés.",
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
          apiFetch("/challenges-talents/stats", { method: "GET" }),
          apiFetch("/challenges-talents/en-cours", { method: "GET" }),
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
      if (activeSubTab === "en_cours" && challengesEnCours.length >= 0) return;
      if (activeSubTab === "avenir" && challengesAvenir.length > 0) return;
      if (activeSubTab === "termines" && challengesTermines.length > 0) return;

      setLoading(true);
      try {
        if (activeSubTab === "avenir") {
          const res = await apiFetch("/challenges-talents/avenir", {
            method: "GET",
          });
          if (res?.statut === 200) {
            setChallengesAvenir(res.challenges_avenir || []);
            setVillesAvenir(res.villes || ["Partout"]);
          }
        } else if (activeSubTab === "termines") {
          const res = await apiFetch("/challenges-talents/termines", {
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
  }, [activeSubTab, token, initialLoadComplete]);

  useEffect(() => {
    setSelectedLocation("Partout");
  }, [activeSubTab]);

  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const getCurrentChallenges = () => {
    if (activeSubTab === "en_cours") return challengesEnCours;
    if (activeSubTab === "avenir") return challengesAvenir;
    if (activeSubTab === "termines") return challengesTermines;
    return [];
  };

  const getCurrentVilles = () => {
    if (activeSubTab === "en_cours") return villesEnCours;
    if (activeSubTab === "avenir") return villesAvenir;
    if (activeSubTab === "termines") return villesTermines;
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
    activeSubTab,
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
    entrepriseNom: c.user?.talent?.nom || c.user?.entreprise?.nom || "Talent",
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

  const currentTabInfo = subTabs.find((t) => t.key === activeSubTab);

  return (
    <div>
      {/* Message d'accueil + Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          Challenges créés ou publiés par des talents
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Retrouvez ici tous les challenges imaginés et partagés par la
          communauté de talents de Talent Innovant.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ key, label, value, icon: Icon, tab }) => (
            <div
              key={key}
              onClick={() => tab && setActiveSubTab(tab)}
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

        {/* CTA créer */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-1">
            Vous avez un challenge à partager ?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Organisez un challenge sur Talent Innovant ou partagez un challenge
            externe avec la communauté. C'est gratuit !
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-md shadow-orange-100"
          >
            <Plus size={16} /> Créer ou publier un challenge
          </button>
        </div>

        {/* Gérer mes challenges */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-700">
            Vous avez déjà des challenges ?
          </p>
          <button
            onClick={() => router.push("/communaute/meschallenges")}
            className="flex items-center gap-2 px-4 py-2 border border-orange-700 text-orange-700 hover:bg-orange-50 font-bold rounded-xl text-sm transition-all"
          >
            <Settings size={15} /> Gérer mes challenges
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div
          className="flex overflow-x-auto scrollbar-hide border-b border-gray-100"
          ref={tabsContainerRef}
        >
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              data-tab={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={cn(
                "px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                activeSubTab === tab.key
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
            key={activeSubTab}
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
          <p className="text-gray-600 text-lg font-medium mb-4">
            Aucun challenge{" "}
            {activeSubTab === "en_cours"
              ? "en cours"
              : activeSubTab === "avenir"
                ? "à venir"
                : "terminé"}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Soyez le premier à en créer un !
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-orange-700 hover:bg-orange-800 text-white"
          >
            Créer un challenge
          </Button>
        </div>
      )}

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

// ── Page principale avec 2 tabs bulle ──
export default function CommunautePage() {
  const [activeMainTab, setActiveMainTab] = useState<
    "classement" | "challenges_talents"
  >("classement");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setShowNavbar(window.scrollY < lastScrollY);
      else setShowNavbar(true);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
            Communauté
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Retrouvez ici : vos performances, le classement des talents et les
            challenges partagés par les talents de la communauté.
          </p>
        </motion.div>

        {/* Tabs bulle */}
        <div className="flex gap-3 mb-6">
          {[
            { key: "classement", label: "🏆 Classement" },
            { key: "challenges_talents", label: "⚡ Challenges Talents" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveMainTab(key as any)}
              className={cn(
                "px-3 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold transition-all duration-300 border",
                activeMainTab === key
                  ? "bg-orange-700 text-white border-orange-700 shadow-md shadow-orange-100"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-700",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenu avec transition fluide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {activeMainTab === "classement" ? (
              <TabClassement />
            ) : (
              <TabChallengesTalents />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
