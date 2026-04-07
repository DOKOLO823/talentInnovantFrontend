"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { ArrowRight, Loader2, Users } from "lucide-react";
import { TalentPropositionCard } from "@/app/collaborateurs/components/TalentPropositionCard";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

interface PartenairesAccueilProps {
  token: string | null;
}

export default function PartenairesAccueil({ token }: PartenairesAccueilProps) {
  const router = useRouter();
  const [talents, setTalents] = useState<any[]>([]);
  const [userRelations, setUserRelations] = useState<{
    ids_demandes_envoyees: number[];
    ids_demandes_recues: number[];
    ids_collaborations_actives: number[];
  }>({
    ids_demandes_envoyees: [],
    ids_demandes_recues: [],
    ids_collaborations_actives: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchPartenaires = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/reseau/propositions-accueil", {
          method: "GET",
        });
        if (res?.statut === 200) {
          setTalents(res.data?.talents || []);
          setUserRelations({
            ids_demandes_envoyees: res.data?.ids_demandes_envoyees || [],
            ids_demandes_recues: res.data?.ids_demandes_recues || [],
            ids_collaborations_actives:
              res.data?.ids_collaborations_actives || [],
          });
        }
      } catch (error) {
        console.error("Erreur chargement partenaires:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartenaires();
  }, [token]);

  const addSentRequest = (recepteurId: number) => {
    setUserRelations((prev) => ({
      ...prev,
      ids_demandes_envoyees: [...prev.ids_demandes_envoyees, recepteurId],
    }));
  };

  if (loading) {
    return (
      <div className="w-full px-5 my-8">
        <div className="h-5 w-64 bg-gray-200 animate-pulse rounded mb-1" />
        <div className="h-4 w-48 bg-gray-100 animate-pulse rounded mb-4" />
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[200px] h-64 bg-gray-100 animate-pulse rounded-xl shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!talents || talents.length === 0) return null;

  return (
    <div className="w-full px-5 md:px-22 my-8">
      <Toaster />
      {/* En-tête de la section */}
      <div className="flex items-center gap-2 mb-1 ">
        <Users size={18} className="text-orange-700" />
        <h2 className="text-base md:text-xl font-semibold text-gray-800">
          Quelques partenaires de projets
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Vous avez une idée ou un projet actuellement ? Trouvez un partenaire
        pour le développer.
      </p>

      {/* Liste scrollable horizontalement */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {talents.map((talent) => (
          <div
            key={talent.id}
            className="shrink-0 w-[260px] md:w-[300px] lg:w-[350px]"
          >
            <TalentPropositionCard
              talent={talent}
              relations={userRelations}
              onSuccess={addSentRequest}
            />
          </div>
        ))}
        {/* Faux card pour indiquer qu'il y a du scroll */}
        <div className="shrink-0 w-4" />
      </div>

      <div className="mt-4 mb-12 flex justify-center">
        <button
          onClick={() => router.push("/collaborateurs")}
          className="flex items-center gap-2 bg-orange-700 text-white px-6 md:px-8 py-3 rounded-full text-xs md:text-base font-bold tracking-widest hover:bg-orange-800 hover:shadow-lg transition-all group"
        >
          Découvrir plus de partenaires
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
