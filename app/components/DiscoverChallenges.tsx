"use client";

// Emplacement conseillé : app/components/DiscoverChallenges.tsx

import { useEffect, useRef, useState } from "react";
import ChallengeCard from "./ChallengeCard";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

// Même mapping que la page home-talent (toutes les infos affichées par ChallengeCard)
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
  views: c.nombrevues || 0,
  rewards: (() => {
    let rewardsArray = ["Prix non défini"];
    try {
      if (typeof c.recompense === "string" && c.recompense !== "null") {
        const parsed = JSON.parse(c.recompense);
        rewardsArray = Object.values(parsed);
      } else if (Array.isArray(c.recompense) && c.recompense.length > 0) {
        rewardsArray = c.recompense;
      }
    } catch (e) {
      console.error("Erreur parsing récompenses:", e);
    }
    return rewardsArray;
  })(),
  categories: Array.isArray(c.domaines)
    ? c.domaines.map((d: any) => d.nom || d.name)
    : ["Innovation"],
  inscriptionEnd: c.datefininscription || "Bientôt",
  entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
  entrepriseLogo: c.user?.pp
    ? `${apifile}/${c.user.pp}`
    : "../assets/images/ppe.png",
  entrepriseId: c.user_id,
});

// Squelette : même silhouette qu'une carte + balayage lumineux ("vent") décalé
// d'une carte à l'autre pour donner une impression de vague.
function SkeletonRow() {
  return (
    <>
      <style>{`
        @keyframes ti-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .ti-skel-card { position: relative; overflow: hidden; }
        .ti-skel-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(255, 255, 255, 0.75) 50%,
            transparent 80%
          );
          transform: translateX(-100%);
          animation: ti-sweep 1.4s ease-in-out infinite;
          animation-delay: var(--d, 0s);
        }
        @media (prefers-reduced-motion: reduce) {
          .ti-skel-card::after { animation: none; }
        }
      `}</style>

      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card flex-shrink-0 w-72 rounded-2xl border border-gray-200 bg-white"
          style={{ ["--d" as any]: `${i * 0.15}s` }}
        >
          {/* image */}
          <div className="h-40 bg-gray-200" />

          <div className="p-4 space-y-4">
            {/* entreprise */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200" />
              <div className="h-3 w-28 rounded bg-gray-200" />
            </div>

            {/* titre */}
            <div className="space-y-2">
              <div className="h-4 w-11/12 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </div>

            {/* badges domaines */}
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-gray-200" />
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>

            {/* infos + bouton */}
            <div className="space-y-2">
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-2/5 rounded bg-gray-200" />
            </div>
            <div className="h-10 w-full rounded-xl bg-gray-200" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function DiscoverChallenges({
  challengeId,
}: {
  challengeId: number | string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  // 1) On ne déclenche la requête que lorsque la section approche de l'écran :
  //    l'affichage du challenge consulté reste prioritaire.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 2) Challenges en cours ayant des domaines en commun (relancé si on change de challenge)
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setStatus("loading");

    apiFetch(`/challenges/similaires/${challengeId}`, { method: "GET" })
      .then((res: any) => {
        if (cancelled) return;
        if (res?.statut === 200) {
          setItems(
            (res.data || [])
              .filter((c: any) => String(c.id) !== String(challengeId)) // sécurité
              .map(mapChallenge),
          );
          setStatus("done");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [visible, challengeId]);

  // Rien à proposer ou erreur : on masque toute la section
  if (status === "error" || (status === "done" && items.length === 0)) {
    return null;
  }

  const isLoading = status === "idle" || status === "loading";

  return (
    <section ref={sectionRef} className="pb-6">
      <h2 className="md:text-2xl font-bold text-gray-900 mb-5 border-l-4 border-orange-700 pl-3">
        Découvrir d'autres challenges :
      </h2>

      <div className="flex gap-3 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {isLoading ? (
          <SkeletonRow />
        ) : (
          items.map((challenge) => (
            <div key={challenge.id} className="flex-shrink-0 w-72 snap-center">
              <ChallengeCard challenge={challenge} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
