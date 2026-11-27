"use client";

// Emplacement : app/components/TopChallengesList.tsx  (REMPLACE le fichier existant)
// Seul changement : la prop facultative `compact`, pour l'afficher dans le fil de la communauté
// (cadre arrondi, peu d'espace) avec des squelettes pendant le chargement.
// Sans la prop, l'affichage de la page d'accueil guest est IDENTIQUE à avant.

import { useState, useEffect } from "react";
import ChallengeCard from "./ChallengeCard";
import { ChallengeSkeletonCards } from "./ChallengeSkeleton";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { Loader2 } from "lucide-react";

export default function TopChallengesList({
  compact = false,
}: {
  compact?: boolean;
}) {
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
            return {
              id: c.id,
              title: c.titre,
              description: c.description,
              image: c.photo
                ? `${apifile}/${c.photo}`
                : "/assets/images/innov.jpg",
              locationType: c.lieu || "",
              site: c.site || "",
              startDate: c.datelancement,
              endDate: c.datefin,
              endInscription: c.datefininscription,
              participants: c.participants_count || 0,
              views: c.nombrevues || 0,
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
    if (compact) {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white py-5">
          <h2 className="mb-4 border-l-4 border-orange-700 pl-3 text-base font-bold text-slate-900 ml-4">
            Les top challenges du moment
          </h2>
          <div className="flex gap-3 overflow-hidden px-4 [&>*]:w-72 [&>*]:shrink-0">
            <ChallengeSkeletonCards count={3} />
          </div>
        </section>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-10 w-full">
        <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-2" />
        <p className="text-gray-500 text-sm font-medium">
          Chargement des challenges populaires...
        </p>
      </div>
    );
  }

  if (challenges?.length === 0) return null;

  return (
    <div className="relative">
      <section
        id={compact ? undefined : "challenges"}
        className={
          compact
            ? "rounded-2xl border border-slate-200 bg-white py-5"
            : "py-20 bg-white"
        }
      >
        <div
          className={
            compact ? "w-full" : "w-full mx-auto pl-2 pr-4 sm:pr-6 lg:pr-8"
          }
        >
          <h2
            className={
              compact
                ? "ml-4 mb-4 border-l-4 border-orange-700 pl-3 text-base font-bold text-slate-900"
                : "md:text-2xl md:text-3xl ml-3 font-bold text-gray-900 mb-5 border-l-4 border-orange-700 pl-3"
            }
          >
            Les top challenges du moment
          </h2>
          {/* Container avec défilement horizontal et snapping */}
          <div className="flex space-x-3 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2">
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
