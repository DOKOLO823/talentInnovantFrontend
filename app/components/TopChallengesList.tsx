"use client";

import { useState, useEffect } from "react";
import ChallengeCard from './ChallengeCard';
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { Loader2 } from "lucide-react";

export default function TopChallengesList() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopChallenges = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/challenges/top-en-cours", {
          method: "GET",
        });

        if (res && res.statut === 200) {
          const mappedData = res.data.map((c: any) => {
            // --- GESTION DES RÉCOMPENSES (Format Objet ou String) ---
            let rewardsArray: string[] = [];
            if (c.recompense) {
              let data = c.recompense;
              // Si c'est une string (JSON), on parse
              if (typeof c.recompense === 'string') {
                try { data = JSON.parse(c.recompense); } catch (e) { data = { prix: c.recompense }; }
              }
              
              // Si c'est un objet, on transforme en tableau de chaînes
              if (typeof data === 'object' && data !== null) {
                rewardsArray = Object.entries(data).map(
                  ([key, val]) => `${key.replace(/_/g, ' ')} : ${val}`
                );
              } else {
                rewardsArray = [String(data)];
              }
            }
            if (rewardsArray.length === 0) rewardsArray = ["Prix à définir"];

            // --- FORMATTAGE DES DATES ---
            const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : "---";

            return {
              id: c.id,
              title: c.titre,
              image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
              locationType: c.lieu === 'en ligne' ? "En ligne" : (c.ville || "Présentiel"),
              startDate: formatDate(c.datelancement),
              endDate: formatDate(c.datefin),
              inscriptionEnd: formatDate(c.datefininscription || c.datefin),
              participants: c.participants_count || 0,
              rewards: rewardsArray,
              // On utilise les catégories si elles existent, sinon un tableau vide
              categories: c.domaines ? c.domaines.map((d: any) => d.nom) : (c.categorie ? [c.categorie.nom] : []),
              entrepriseNom: c.user?.entreprise?.nom || c.user?.email.split('@')[0] || "Entreprise",
              entrepriseLogo: c.user?.pp ? `${apifile}/${c.user.pp}` : "/assets/images/innov.jpg",
              entrepriseId: c.user?.id || 1
            };
          });
          setChallenges(mappedData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des top challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopChallenges();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 w-full">
        <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-2" />
        <p className="text-gray-500 text-sm font-medium">Chargement des challenges populaires...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">Aucun challenge populaire en cours pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Container avec défilement horizontal et snapping */}
      <div className="flex space-x-6 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="flex-shrink-0 w-72 snap-center">
            <ChallengeCard challenge={challenge} />
          </div>
        ))}
      </div>
      
      {/* Petit indicateur visuel pour le scroll sur mobile */}
      <div className="flex justify-center gap-1 mt-2 md:hidden">
        {challenges.slice(0, 5).map((_, i) => (
          <div key={i} className="h-1 w-4 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  );
}