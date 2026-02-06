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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "../components/BackButton";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

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

  // Charger les statistiques et infos du talent connecté (BD)
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setLoadingStats(true);
        const res = await apiFetch("/talent/statistiques", { method: "GET" });
        if (res?.statut === 200) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [token]);

  // Charger les innovateurs les plus actifs
  useEffect(() => {
    const fetchInnovators = async () => {
      if (!token) return;
      try {
        setLoadingInnovators(true);
        const res = await apiFetch("/talents/top", { method: "GET" });
        if (res?.statut === 200) {
          const mappedTalents = res.top10.map((t: any) => ({
            id: t.user_id,
            name: `${t.nom} ${t.prenom || ""}`,
            points: t.point || 0,
            rang: t.rang, // Rang venant du backend ("1er", "2e")
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
    fetchInnovators();
  }, [token]);

  // Charger les entreprises les plus actives
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      try {
        setLoadingCompanies(true);
        const res = await apiFetch("/entreprises/top", { method: "GET" });
        if (res?.statut === 200) {
          setCompanies(res.top10); // Utilise le rang backend directement
        }
      } catch (error) {
        console.error("Erreur chargement entreprises:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [token]);

  // const handleToggleAbonnement = async (
  //   e: React.MouseEvent,
  //   entrepriseId: number
  // ) => {
  //   e.stopPropagation();
  //   if (isToggling) return;
  //   try {
  //     setIsToggling(entrepriseId);
  //     const res = await apiFetch("/entreprise/abonnement/toggle", {
  //       method: "POST",
  //       body: JSON.stringify({ entreprise_id: entrepriseId }),
  //     });
  //     if (res.statut === 200) {
  //       if(res?.message=='Abonnement réussi.'){
  //         toast.success('Vous serez informé des opportunités proposées par cette entreprise',{duration:5000})
  //       }else if(res?.message!='Abonnement réussi.'){
  //         toast.success(res?.message || 'Désabonnement réussi.')
  //       }
  //       setCompanies((prev) =>
  //         prev.map((c) =>
  //           c.id === entrepriseId ? { ...c, is_abonne: res.abonne } : c
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Erreur toggle:", err);
  //   } finally {
  //     setIsToggling(null);
  //   }
  // };

  // Calcul dynamique du pourcentage
  const calculateProgress = () => {
    if (!stats || !stats.nombre_talents || !stats.rang) return 0;

    // Nettoyage du rang (ex: "1er" -> 1, "2e" -> 2)
    const currentRang = parseInt(stats.rang.replace(/\D/g, ""));
    const total = stats.nombre_talents;

    if (total <= 1) return 100;

    // Calcul inversé : si tu es 1er, tu es à 100% de l'objectif de classement
    const percentage = ((total - currentRang + 1) / total) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
        animate={{ y: showNavbar ? 0 : -100 }}
      />
      <Toaster/>
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
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
            </div>
          ) : (
            stats && (
              <>
                {/* Profil provenant de la BD */}
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
                          src={stats?.user?.pp ? apifile+'/'+stats?.user?.pp : '../assets/images/pp2.png'}
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
                              ? `${stats?.talent?.profession.substring(
                                  0,
                                  25
                                )}...`
                              : stats?.talent?.profession}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>

                {/* Statistiques provenant de la BD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 mb-2 sm:mb-3 mx-auto">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-700 text-center mb-1">
                      {stats.rang}
                      <span className="text-[11px] text-black font-normal ml-1">
                        / {stats.nombre_talents}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center font-medium leading-relaxed">
                      Rang sur Talent Innovant
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 mb-2 sm:mb-3 mx-auto">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-700 text-center mb-1">
                      {stats.points}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center font-medium leading-relaxed">
                      Points
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 mb-2 sm:mb-3 mx-auto">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-700 text-center mb-1">
                      {stats.nombre_challenges}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center font-medium leading-relaxed">
                      Challenges participés
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 mb-2 sm:mb-3 mx-auto">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-700 text-center mb-1">
                      {stats.nombre_projets}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center font-medium leading-relaxed">
                      Projets soumis
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
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
            )
          )}
        </section>

        {/* Innovateurs les plus actifs */}
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Les talents les plus actifs
            </h2>
          </div>

          {loadingInnovators ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0">
              {innovators.map((innovator, index) => {
                let SpecialIcon: any = null;
                if (index === 0) SpecialIcon = Crown;
                else if (index === 1) SpecialIcon = Medal;
                else if (index === 2) SpecialIcon = Star;

                return (
                  <motion.div
                  key={innovator.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex-shrink-0 w-64 sm:w-72"
>
  {/* Badge Projets - Affiché uniquement si > 0 */}
  {innovator?.nombre_projets > 0 && (
    <div className="absolute top-4 right-4">
      <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100">
        {innovator.nombre_projets} Projets
      </span>
    </div>
  )}

  <div className="text-center">
    {/* Avatar avec lien vers profil et Icone Spéciale (Couronne, etc.) */}
    <Link href={'/profil-talent/' + innovator.id} className="relative inline-block mb-4">
      <img
        src={innovator.avatar}
        alt={innovator.name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:border-orange-100 transition-all"
      />
      {SpecialIcon && (
        <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
          <SpecialIcon className="w-5 h-5 text-orange-600" />
        </div>
      )}
    </Link>

    {/* Nom et Profession */}
    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-orange-700 transition-colors">
      {innovator?.name?.length > 20
        ? `${innovator?.name.substring(0, 20)}...`
        : innovator?.name}
    </h3>
    <p className="text-sm text-gray-500 mb-4 font-medium h-5 truncate leading-relaxed">
      {innovator.profession?.length > 25
        ? `${innovator.profession.substring(0, 25)}...`
        : innovator.profession}
    </p>

    {/* Points et Rang */}
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="flex items-center gap-1.5 px-3 py-1  rounded-full">
        <Trophy className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-bold text-orange-700">
          {innovator.points} <span className="text-[10px]">pts</span>
        </span>
      </div>
      <span className="text-sm font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-1">
        {SpecialIcon && <SpecialIcon className="w-3 h-3 text-orange-600" />}
        {innovator.rang}
      </span>
    </div>

    {/* Actions : Contacter et Voir Profil */}
    <div className="flex items-center gap-x-2">

      <button
        onClick={() => router.push('/profil-talent/' + innovator.id)}
        className="w-full hover:bg-orange-700 text-orange-700 border border-orange-700 hover:text-white font-semibold rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">Voir le profil</span>
      </button>
    </div>
  </div>
</motion.div>
                );
              })}
            </div>
          )}
        </section>

      {/* Entreprises les plus actives */}
<section>
  <div className="flex items-center gap-2 mb-4 sm:mb-5">
    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 flex-shrink-0" />
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
      Les entreprises les plus actives
    </h2>
  </div>

  {loadingCompanies ? (
    <div className="flex justify-center py-10">
      <Loader2 className="w-8 h-8 animate-spin text-orange-700" />
    </div>
  ) : (
    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0">
      {companies.map((company, index) => {
        let SpecialIcon: any = null;
        let rankColor = "text-gray-600 bg-gray-50 border-gray-100";
        
        if (index === 0) {
          SpecialIcon = Crown;
          rankColor = "text-yellow-700 bg-yellow-50 border-yellow-100";
        } else if (index === 1) {
          SpecialIcon = Medal;
          rankColor = "text-slate-500 bg-slate-50 border-slate-100";
        } else if (index === 2) {
          SpecialIcon = Star;
          rankColor = "text-orange-600 bg-orange-50 border-orange-100";
        }

        return (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-64 sm:w-72 snap-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
          >
            {/* Décoration de fond au survol */}
            <div className="absolute -right-10 -top-10 w-28 h-28 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

            {/* Badge Challenges - Style Raffiné */}
            <div className="flex justify-end mb-4 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                {company.nombre_challenges || 0} Challenge(s)
              </div>
            </div>

            {/* Contenu cliquable vers le profil */}
            <div
              className="cursor-pointer text-center relative z-10"
              onClick={() => router.push(`/profil-entreprise/${company?.user_id}`)}
            >
              <div className="relative inline-block mb-4">
                <img
                  src={
                    company.user?.pp
                      ? `${apifile}/${company?.user?.pp}`
                      : "/assets/images/ppe.png"
                  }
                  alt={company.nom}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto object-cover shadow-lg border-4 border-white group-hover:border-orange-50 transition-all duration-300"
                />
              </div>

              <h3 className="font-bold text-gray-900 mb-1 truncate text-base sm:text-lg group-hover:text-orange-700 transition-colors">
                {company?.nom?.length > 20
                  ? `${company?.nom.substring(0, 20)}...`
                  : company?.nom}
              </h3>

              {/* Points et Rang */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-xs font-semibold text-gray-400 tracking-tighter">
                  {company.point || 0} pts
                </span>
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${rankColor}`}>
                  {SpecialIcon && (
                    <SpecialIcon className="w-3.5 h-3.5" />
                  )}
                  {company.rang}
                </span>
              </div>
            </div>

            {/* Bouton d'action avec gestion d'état */}
            <div className="mt-auto relative z-10">
              <button
               onClick={() => router.push(`/profil-entreprise/${company?.user_id}`)}
                // onClick={(e) => handleToggleAbonnement(e, company.id)}
                // disabled={isToggling === company.id}
                className="w-full transition-all duration-300 font-bold rounded-xl py-2.5 shadow-sm active:scale-95 bg-orange-700 hover:bg-orange-800 text-white shadow-orange-100 shadow-lg"
                  // company.is_abonne
                  //   ? "bg-gray-50 text-gray-500 hover:bg-red-50 border border-gray-100"
                  //   : "bg-orange-700 hover:bg-orange-800 text-white shadow-orange-100 shadow-lg"
                // }
              >
                {/* {isToggling === company.id ? (
                  <div className="flex flex-row justify-center items-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : company.is_abonne ? ( */}
                  {/* <span className="text-xs sm:text-sm">Se désabonner</span> */}
                {/* ) : (
                  <span className="text-xs sm:text-sm">S'abonner</span>
                )} */}

                 <span className="text-sm">Voir l'entreprise</span>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  )}
</section>

      </div>
    </div>
  );
}
