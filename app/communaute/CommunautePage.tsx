"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Trophy,
  Target,
  Award,
  TrendingUp,
  Users,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  Crown,
  Medal,
  Star,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../components/BackButton";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

// --- COMPOSANTS SKELETON ---
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

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-dashed border-gray-200">
    <div className="bg-orange-50 p-4 rounded-full mb-4">
      <WifiOff className="w-8 h-8 text-orange-700" />
    </div>
    <h3 className="text-gray-900 font-bold text-lg">Connexion instable</h3>
    <p className="text-gray-500 text-sm max-w-[250px] mt-2 mb-6">
      Nous n'avons pas pu charger les données. Vérifiez votre connexion
      internet.
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-2.5 bg-orange-700 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-orange-100"
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

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { token } = useAuth();
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
      console.error(error);
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
        const mapped = res?.top100?.map((t: any) => ({
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
        setInnovators(mapped);
      }
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Découvrez les innovateurs et entreprises les plus actifs
          </p>
        </motion.div>

        {/* --- PERFORMANCE --- */}
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
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-6 w-full md:max-w-[50%] lg:max-w-[33%]"
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
                      alt="Profil"
                      className="w-14 h-14 rounded-full object-cover border-2 border-orange-100"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 uppercase truncate max-w-[150px]">
                      {stats?.talent?.nom}
                    </h3>
                    <p className="text-gray-500 text-sm truncate max-w-[180px]">
                      {stats?.talent?.profession}
                    </p>
                  </div>
                </Link>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  {
                    label: "Rang sur Talent Innovant",
                    val: stats.rang,
                    sub: `/ ${stats.nombre_talents}`,
                    icon: Trophy,
                  },
                  { label: "Points", val: stats.points, icon: Award },
                  {
                    label: "Challenges participés",
                    val: stats.nombre_challenges,
                    icon: Target,
                  },
                  {
                    label: "Projets soumis",
                    val: stats.nombre_projets,
                    icon: TrendingUp,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 mb-2 mx-auto flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-orange-700" />
                    </div>
                    <div className="text-xl font-bold text-orange-700">
                      {item.val}{" "}
                      {item.sub && (
                        <span className="text-[10px] text-black font-normal">
                          {item.sub}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">
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
                    transition={{ duration: 1.2 }}
                    className="h-full bg-orange-700"
                  />
                </div>
              </div>
            </>
          ) : (
            <EmptyState onRetry={fetchStats} />
          )}
        </section>

        {/* --- TALENTS --- */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4">
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
              <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {innovators.map((innovator, index) => {
                  const Icon =
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-64 sm:w-72 flex-shrink-0 text-center group"
                    >
                      {innovator.nombre_projets > 0 && (
                        <div className="absolute top-4 right-4 bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-100">
                          {innovator.nombre_projets} Projet(s)
                        </div>
                      )}
                      <Link
                        href={"/profil-talent/" + innovator.id}
                        className="relative inline-block mb-4"
                      >
                        <img
                          src={innovator.avatar}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-orange-100"
                          alt={innovator.name}
                        />
                        {Icon && (
                          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
                            <Icon className="w-4 h-4 text-orange-600" />
                          </div>
                        )}
                      </Link>
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-700">
                        {innovator.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 truncate">
                        {innovator.profession}
                      </p>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="bg-orange-50 px-3 py-1 rounded-full text-orange-700 text-sm font-bold flex items-center gap-1.5">
                          <Trophy className="w-3 h-3" /> {innovator.points} pts
                        </div>
                        <span className="text-sm font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                          {innovator.rang}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          router.push("/profil-talent/" + innovator.id)
                        }
                        className="w-full text-orange-700 border border-orange-700 hover:bg-orange-700 hover:text-white font-bold rounded-xl py-2.5 transition-all text-sm"
                      >
                        Voir le profil
                      </button>
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
            <EmptyState onRetry={fetchInnovators} />
          )}
        </section>

        {/* --- ENTREPRISES --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
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
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {companies.map((company, index) => {
                  const rankStyle =
                    index === 0
                      ? "text-yellow-700 bg-yellow-50 border-yellow-100"
                      : index === 1
                        ? "text-slate-500 bg-slate-50 border-slate-100"
                        : "text-orange-600 bg-orange-50 border-orange-100";
                  return (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-64 sm:w-72 flex-shrink-0 flex flex-col group"
                    >
                      <div className="flex justify-end mb-4">
                        <div className="bg-orange-50 text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-100">
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
                          className="w-24 h-24 rounded-2xl mx-auto object-cover shadow-lg border-4 border-white mb-4"
                          alt={company.nom}
                        />
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-700 flex items-center justify-center gap-1.5">
                          {company.nom}
                          {company.user?.certifie && (
                            <CheckCircle2 className="w-4 h-4 text-orange-700 fill-orange-700/10" />
                          )}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-2 mb-6">
                          <span className="text-xs text-gray-400 font-semibold">
                            {company.point || 0} pts
                          </span>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-lg border ${rankStyle}`}
                          >
                            {company.rang}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/profil-entreprise/${company?.user_id}`)
                        }
                        className="mt-auto w-full bg-orange-700 text-white font-bold rounded-xl py-2.5 shadow-lg shadow-orange-100 text-sm"
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
            <EmptyState onRetry={fetchCompanies} />
          )}
        </section>
      </div>
    </div>
  );
}
