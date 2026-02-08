"use client";

import { useState, useEffect } from "react";
import ChallengeCard from "./ChallengeCard";
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
            // let rewardsArray: string[] = ["Prix non défini"];
            // if (c.recompense) {
            //   let data = c.recompense;
            //   // Si c'est une string (JSON), on parse
            //   if (typeof c.recompense === "string") {
            //     try {
            //       data = JSON.parse(c.recompense);
            //     } catch (e) {
            //       data = { prix: c.recompense };
            //     }
            //   }

            //   // Si c'est un objet, on transforme en tableau de chaînes
            //   if (typeof data === "object" && data !== null) {
            //     rewardsArray = Object.entries(data).map(
            //       ([key, val]) => `${key.replace(/_/g, " ")} : ${val}`,
            //     );
            //   } else {
            //     rewardsArray = [String(data)];
            //   }
            // }
            // if (rewardsArray.length === 0) rewardsArray = ["Prix non défini"];

            // --- FORMATTAGE DES DATES ---
            const formatDate = (d: string) =>
              d
                ? new Date(d).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })
                : "---";

            return {
              id: c.id,
              title: c.titre,
              image: c.photo
                ? `${apifile}/${c.photo}`
                : "/assets/images/innov.jpg",
              locationType: c.lieu,
              startDate: c.datelancement,
              endDate: c.datefin,
              endInscription: c.datefininscription,
              participants: c.participants_count || 0,
              rewards: (() => {
                let rewardsArray = ["Prix non défini"];
                try {
                  if (
                    typeof c.recompense === "string" &&
                    c.recompense !== "null"
                  ) {
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
              // On utilise les catégories si elles existent, sinon un tableau vide
              categories: c.domaines
                ? c.domaines.map((d: any) => d.nom)
                : c.categorie
                  ? [c.categorie.nom]
                  : [],
              entrepriseNom:
                c.user?.entreprise?.nom ||
                c.user?.email.split("@")[0] ||
                "Entreprise",
              entrepriseLogo: c.user?.pp
                ? `${apifile}/${c.user.pp}`
                : "/assets/images/innov.jpg",
              entrepriseId: c.user?.id || 1,
            };
          });
          setChallenges(mappedData);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des top challenges:",
          error,
        );
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
        <p className="text-gray-500 text-sm font-medium">
          Chargement des challenges populaires...
        </p>
      </div>
    );
  }

  if (challenges?.length === 0) return;

  return (
    <div className="relative">
      <section id="challenges" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="md:text-2xl md:text-3xl font-bold text-gray-900 mb-5 border-l-4 border-orange-700 pl-3">
            Les top challenges du moment
          </h2>
          {/* Container avec défilement horizontal et snapping */}
          <div className="flex space-x-6 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2">
            {challenges?.map((challenge) => (
              <div
                key={challenge.id}
                className="flex-shrink-0 w-72 snap-center"
              >
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
      </section>
    </div>
  );
}
