"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Loader2,
  Trophy,
  Target,
  Award,
  TrendingUp,
  Users,
  Building2,
  UserCircle,
  Briefcase,
  Crown,
  Medal,
  Star,
  User,
  ArrowRight,
  CheckCircle2,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../components/BackButton";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

// --- SKELETONS ---
const PerformanceSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 mb-6 w-full md:max-w-[50%] lg:max-w-[33%]">
      <div className="w-14 h-14 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
      Vérifiez votre connexion internet pour voir les derniers résultats.
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-orange-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-orange-100"
    >
      <RefreshCw className="w-4 h-4" />
      Actualiser
    </button>
  </div>
);

export default function CommunautePage() {
  const [stats, setStats] = useState<any>(null);
  const [innovators, setInnovators] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingInnovators, setLoadingInnovators] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { user: authUser, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNavbar(window.scrollY < lastScrollY);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const res = await apiFetch("/talent/statistiques", { method: "GET" });
      if (res?.statut === 200) setStats(res.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
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
        const mappedTalents = res?.top100?.map((t: any) => ({
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
        }));
        setInnovators(mappedTalents);
      }
    } catch (error) {
      console.error("Erreur chargement innovateurs:", error);
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
    } catch (error) {
      console.error("Erreur chargement entreprises:", error);
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
    if (!stats || !stats.nombre_talents || !stats.rang) return 0;
    const currentRang = parseInt(stats.rang.replace(/\D/g, ""));
    const total = stats.nombre_talents;
    if (total <= 1) return 100;
    const percentage = ((total - currentRang + 1) / total) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
        animate={{ y: showNavbar ? 0 : -100 }}
      />
      <Toaster />
      <BackButton m={16} />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Communauté
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
            Découvrez les innovateurs et entreprises les plus actifs
          </p>
        </motion.div>

        {/* Section Mes Performances */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 flex-shrink-0" />
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
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-6 w-full md:max-w-2/4 lg:max-w-1/3"
              >
                <Link
                  href={`/profil-talent/${stats?.user.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative">
                    <img
                      src={
                        stats?.user?.pp
                          ? apifile + "/" + stats?.user?.pp
                          : "../assets/images/pp2.png"
                      }
                      alt="Ma photo"
                      className="w-14 h-14 rounded-full object-cover border-2 border-orange-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight line-clamp-1">
                      {stats?.talent?.nom}
                    </h3>
                    {stats.talent?.profession && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                        <span>
                          {stats?.talent?.profession?.length > 25
                            ? `${stats?.talent?.profession.substring(0, 25)}...`
                            : stats?.talent?.profession}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto">
                    <Trophy className="w-5 h-5 text-orange-700" />
                  </div>
                  <div
                    className={`${stats?.rang?.includes("ex-") ? "text-sm" : "text-2xl"} font-bold text-orange-700 mb-1`}
                  >
                    {stats.rang}
                    <span className="text-[11px] text-black font-normal ml-1">
                      / {stats.nombre_talents}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Rang sur Talent Innovant
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto">
                    <Award className="w-5 h-5 text-orange-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-700 mb-1">
                    {stats.points}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Points
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto">
                    <Target className="w-5 h-5 text-orange-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-700 mb-1">
                    {stats.nombre_challenges}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Challenges participés
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto">
                    <TrendingUp className="w-5 h-5 text-orange-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-700 mb-1">
                    {stats.nombre_projets}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Projets soumis
                  </p>
                </div>
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
                <div className="mt-3">
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed italic">
                    {stats.rang === "1er"
                      ? "Félicitations ! Vous êtes au sommet. Maintenez vos efforts et continuez de travailler pour ne pas vous faire dépasser."
                      : "Continuez de participer aux challenges pour améliorer vos performances et gravir les échelons !"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <ConnectionError onRetry={fetchStats} />
          )}
        </section>

        {/* Section Innovateurs */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 flex-shrink-0" />
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
              <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0">
                {innovators.map((innovator, index) => {
                  let SpecialIcon: any =
                    index === 0
                      ? Crown
                      : index === 1
                        ? Medal
                        : index === 2
                          ? Star
                          : null;
                  return (
                    <motion.div
                      key={innovator.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex-shrink-0 w-64 sm:w-72"
                    >
                      {innovator?.nombre_projets > 0 && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100">
                            {innovator.nombre_projets} Projet(s)
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <Link
                          href={"/profil-talent/" + innovator.id}
                          className="relative inline-block mb-4"
                        >
                          <img
                            src={innovator.avatar}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-orange-100 transition-all"
                            alt={innovator.name}
                          />
                          {SpecialIcon && (
                            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
                              <SpecialIcon className="w-5 h-5 text-orange-600" />
                            </div>
                          )}
                        </Link>

                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-orange-700 transition-colors">
                          {innovator.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-medium h-5 truncate">
                          {innovator.profession}
                        </p>

                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="flex items-center gap-1 py-1">
                            <Trophy className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-bold text-orange-700">
                              {innovator.points}{" "}
                              <span className="text-[10px]">pts</span>
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-1">
                            {innovator.rang}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            router.push("/profil-talent/" + innovator.id)
                          }
                          className="w-full hover:bg-orange-700 text-orange-700 border border-orange-700 hover:text-white font-semibold rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
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
                <div
                  onClick={() => router.push("/communaute/talents")}
                  className="bg-white py-3 text-sm sm:text-md text-orange-700 border border-orange-200 hover:bg-orange-50 font-bold rounded-xl px-8 cursor-pointer"
                >
                  Voir tous les talents{" "}
                  <ArrowRight className="w-4 h-4 inline-block ml-1" />
                </div>
              </div>
            </>
          ) : (
            <ConnectionError onRetry={fetchInnovators} />
          )}
        </section>

        {/* Section Entreprises */}
        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 flex-shrink-0" />
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
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0">
                {companies.map((company, index) => {
                  let rankColor =
                    index === 0
                      ? "text-yellow-700 bg-yellow-50 border-yellow-100"
                      : index === 1
                        ? "text-slate-500 bg-slate-50 border-slate-100"
                        : "text-orange-600 bg-orange-50 border-orange-100";
                  return (
                    <motion.div
                      key={company.id}
                      className="flex-shrink-0 w-64 sm:w-72 snap-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group"
                    >
                      <div className="flex justify-end mb-4">
                        <div className="bg-white/80 backdrop-blur-sm text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                          {company.nombre_challenges || 0} Challenge(s)
                        </div>
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
                              ? `${apifile}/${company?.user?.pp}`
                              : "/assets/images/ppe.png"
                          }
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto object-cover shadow-lg border-4 border-white mb-4"
                          alt={company.nom}
                        />
                        <h3 className="font-bold text-gray-900 mb-1 truncate text-base sm:text-lg flex items-center justify-center gap-1.5">
                          {company.nom}
                          {company?.user?.certifie && (
                            <CheckCircle2 className="w-4 h-4 text-orange-700 fill-orange-700/10 flex-shrink-0" />
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
                        className="w-full transition-all duration-300 font-bold rounded-xl py-2.5 bg-orange-700 hover:bg-orange-800 text-white shadow-orange-100 shadow-lg text-sm"
                      >
                        Voir l'entreprise
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-center mt-4">
                <div
                  onClick={() => router.push("/communaute/entreprises")}
                  className="bg-white py-3 text-sm sm:text-md text-orange-700 border border-orange-200 hover:bg-orange-50 font-bold rounded-xl px-8 cursor-pointer"
                >
                  Voir toutes les entreprises{" "}
                  <ArrowRight className="w-4 h-4 inline-block ml-1" />
                </div>
              </div>
            </>
          ) : (
            <ConnectionError onRetry={fetchCompanies} />
          )}
        </section>
      </div>
    </div>
  );
}
