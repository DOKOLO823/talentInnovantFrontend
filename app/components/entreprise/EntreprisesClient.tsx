"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Loader2,
  Trophy,
  Crown,
  Medal,
  Star,
  User,
  Check,
  Plus,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function EntreprisesClient({
  allEntreprises,
}: {
  allEntreprises: any[];
}) {
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>(allEntreprises);
  const [loadingTop, setLoadingTop] = useState(true);
  const [isToggling, setIsToggling] = useState<number | null>(null);
  const router = useRouter();

  // Charger le Top 10 (Tendances)
  useEffect(() => {
    const userStr = localStorage.getItem("auth");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }

    const fetchTopCompanies = async () => {
      try {
        setLoadingTop(true);
        const res = await apiFetch("/entreprises/top", { method: "GET" });
        if (res?.statut === 200) {
          setTopCompanies(res.top100);
        }
      } catch (error) {
        console.error("Erreur chargement top entreprises:", error);
      } finally {
        setLoadingTop(false);
      }
    };
    fetchTopCompanies();
  }, []);

  const handleToggleAbonnement = async (
    e: React.MouseEvent,
    entrepriseId: number,
  ) => {
    e.stopPropagation();
    if (isToggling) return;
    try {
      setIsToggling(entrepriseId);
      const res = await apiFetch("/entreprise/abonnement/toggle", {
        method: "POST",
        body: JSON.stringify({ entreprise_id: entrepriseId }),
      });

      if (res.statut === 200) {
        const isNowAbonne = res.abonne;
        toast.success(
          isNowAbonne
            ? "Vous recevrez les prochaines opportunités !"
            : "Désabonnement réussi.",
          { icon: isNowAbonne ? "🔔" : "🔕" },
        );

        // Mettre à jour les deux listes
        const updateList = (list: any[]) =>
          list.map((c) =>
            c.id === entrepriseId ? { ...c, is_abonne: isNowAbonne } : c,
          );

        setTopCompanies((prev) => updateList(prev));
        setCompanies((prev) => updateList(prev));
      }
    } catch (err) {
      toast.error("Une erreur est survenue.");
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="max-w-full overflow-hidden space-y-12 pb-10">
      {/* Header Section */}
      <div className="bg-white p-8 mt-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Les Entreprises
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Découvrez les leaders de l'innovation.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Section Tendances (Horizontal Scroll) */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Trophy className="w-5 h-5 text-orange-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Les entreprises en tendances{" "}
              {topCompanies.length > 0 ? `(${topCompanies.length})` : ""}
            </h3>
          </div>
        </div>

        {loadingTop ? (
          <div className="flex justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-orange-700 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Récupération des entreprises...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-12">
            {topCompanies.map((company, index) => (
              <EntrepriseCard
                key={`top-${company.id}`}
                company={company}
                index={index}
                isTop={true}
                isToggling={isToggling}
                onToggle={handleToggleAbonnement}
                router={router}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- COMPOSANT CARD RÉUTILISABLE ---
function EntrepriseCard({
  company,
  index,
  isTop,
  isToggling,
  onToggle,
  router,
}: any) {
  let SpecialIcon =
    isTop && index === 0
      ? Crown
      : isTop && index === 1
        ? Medal
        : isTop && index === 2
          ? Star
          : null;
  const rankStyle =
    index === 0
      ? "text-yellow-700 bg-yellow-50 border-yellow-100"
      : index === 1
        ? "text-slate-500 bg-slate-100 border-slate-200"
        : index === 2
          ? "text-orange-600 bg-orange-50 border-orange-100"
          : "text-gray-500 bg-gray-50 border-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.05 }}
      className={`${isTop ? "w-64 sm:w-72 flex-shrink-0 snap-center" : "w-full"} 
        bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col`}
    >
      {/* Badge Challenges */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-white/90 backdrop-blur-sm text-orange-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border border-orange-100 shadow-sm">
          {company.nombre_challenges || 0} Challenge(s)
        </span>
      </div>

      <div className="text-center flex-grow pt-4">
        {/* Logo / Avatar */}
        <div
          onClick={() =>
            router.push(`/profil-entreprise/${company.user_id || company.id}`)
          }
          className="relative inline-block mb-4 cursor-pointer group-hover:scale-105 transition-transform duration-300"
        >
          <img
            src={
              company.user?.pp
                ? `${apifile}/${company.user.pp}`
                : company.avatar || "/assets/images/ppe.png"
            }
            alt={company.nom || company.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md"
          />
          {isTop && SpecialIcon && (
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-50">
              <SpecialIcon
                className={`w-5 h-5 ${index === 0 ? "text-yellow-500" : "text-orange-600"}`}
              />
            </div>
          )}
        </div>

        {/* Nom */}
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-orange-700 transition-colors px-2">
          {company.nom || company.name}
        </h3>

        {/* Points & Rang */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-gray-400 tracking-widest">
            {company.point || company.score || 0} pts
          </span>
          {isTop && (
            <span
              className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md border ${rankStyle}`}
            >
              {company.rang || index + 1}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-auto">
        {/* <button
          onClick={(e) => onToggle(e, company.id)}
          disabled={isToggling === company.id}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            company.is_abonne
              ? "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 border border-gray-100"
              : "bg-orange-700 text-white hover:bg-orange-800 shadow-lg"
          }`}
        >
          {isToggling === company.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : company.is_abonne ? (
            <>Se désabonner</>
          ) : (
            <>S'abonner</>
          )}
        </button> */}

        <Link
          href={`/profil-entreprise/${company.user_id || company.id}`}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-400 hover:text-orange-700 flex items-center justify-center gap-1 transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          Voir profil
        </Link>
      </div>
    </motion.div>
  );
}
