"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChallengeCard from "@/app/components/ChallengeCard";
import { Search, Loader2 } from "lucide-react";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import FiltreChallenge from "@/app/components/recherche/FiltreChallenge";
import BackToTop from "@/app/components/BackToTop";
import BottomBar from "@/app/components/BottomBar";
import Navbar from "@/app/components/Navbar";

export default function SearchClient() {
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("domaine") || "");
  const [location, setLocation] = useState(searchParams.get("lieu") || "");
  const [categoryName, setCategoryName] = useState(
    searchParams.get("domaineName") || "",
  );
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async (domaineId?: string, lieuName?: string) => {
    setLoading(true);
    try {
      const res = await apiFetch("/challenges/filtre/resultat", {
        method: "POST",
        body: JSON.stringify({
          domaines: domaineId ? [domaineId] : [],
          lieu: lieuName || "Partout",
        }),
      });

      if (res && res.statut === 200) {
        const mappedData = res.data.map((c: any) => {
          // --- GESTION ROBUSTE DES RÉCOMPENSES ---
          let rewardsArray: string[] = [];

          if (c.recompense) {
            let data = c.recompense;
            // Si c'est une string, on essaie de parser, sinon on garde l'objet
            if (typeof c.recompense === "string") {
              try {
                data = JSON.parse(c.recompense);
              } catch (e) {
                data = { prix: c.recompense };
              }
            }

            // On transforme l'objet {1er_prix: "..."} en tableau ["1er prix : ..."]
            if (typeof data === "object" && data !== null) {
              rewardsArray = Object.entries(data).map(([key, val]) => `${val}`);
            } else {
              rewardsArray = [String(data)];
            }
          }

          if (rewardsArray.length === 0) rewardsArray = ["Prix à définir"];

          const formatDate = (d: string) =>
            d
              ? new Date(d).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })
              : "---";
          const formatDateFull = (d: string) =>
            d
              ? new Date(d).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "---";

          return {
            id: c.id,
            title: c.titre,
            image: c.photo
              ? `${apifile}/${c.photo}`
              : "/assets/images/innov.jpg",
            locationType: c.lieu,
            site: c.site || "Non spécifié",
            startDate: c.datelancement,
            endDate: c.datefin,
            endInscription: c.datefininscription || c.datefin,
            participants: c.participants_count || 0,
            rewards: rewardsArray,
            categories: c.domaines ? c.domaines.map((d: any) => d.nom) : [],
            entrepriseNom: c.user?.entreprise?.nom || "Entreprise",
            entrepriseLogo: c.user?.pp
              ? `${apifile}/${c.user.pp}`
              : "/assets/images/innov.jpg",
            entrepriseId: c.user?.entreprise?.id || 1,
          };
        });
        setResults(mappedData);
      }
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCategory(searchParams.get("domaine") || "");
    setLocation(searchParams.get("lieu") || "");
    setCategoryName(searchParams.get("domaineName") || "");
    fetchChallenges(
      searchParams.get("domaine") || undefined,
      searchParams.get("lieu") || undefined,
    );
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <BackButton m={16} />

      <FiltreChallenge />

      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-xl font-bold text-gray-900 mb-8">
          {loading ? "Recherche..." : `${results.length} Résultat(s) pour `}{" "}
          {!loading && (
            <span className="text-orange-700">{`${(categoryName && categoryName) || "Tous les domaines"} ${(location && ": " + location) || ": Partout"}`}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-xl border border-dashed mb-12">
            Aucun résultat trouvé.
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
            {results.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </section>

      <BackToTop />
    </div>
  );
}
