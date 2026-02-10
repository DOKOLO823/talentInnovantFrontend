"use client";

import { Star } from "lucide-react";

export default function TabsAbout({ user }: any) {
  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const secondaryDomains =
    user?.domaines_secondaires?.length > 0
      ? user.domaines_secondaires.map((d: any) => d.nom).join(" - ")
      : null;

  const getLevelData = (pts: any) => {
    const points = parseInt(pts) || 0;
    if (points >= 10000) return { name: "Visionnaire", stars: 5 };
    if (points >= 5000) return { name: "Leader", stars: 4 };
    if (points >= 2500) return { name: "Élite", stars: 3 };
    if (points >= 1000) return { name: "Expert", stars: 2 };
    return { name: "Explorateur", stars: 1 };
  };

  const calculatePerformance = (rank: any, total: any) => {
    const r = parseInt(rank);
    const t = parseInt(total);
    if (isNaN(r) || isNaN(t) || t === 0) return "Calcul en cours...";
    if (r === 1) return "1er sur l'ensemble de la plateforme";
    const perf = (1 - r / t) * 100;
    const topPercent = Math.max(Math.min(100 - Math.round(perf) + 1, 100), 1);
    return `Top ${topPercent}% des meilleurs talents`;
  };

  const levelInfo = getLevelData(user?.points);

  const getStars = (filledCount: number) => (
    <span className="inline-flex items-center mx-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < filledCount
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </span>
  );

  return (
    <div className="space-y-3">
      <Item label="Domaine principal" value={user?.domaine?.nom} user={user} />
      <Item label="Domaines secondaires" value={secondaryDomains} />
      <Item label="Compétences" value={user?.skills?.join(", ")} />

      <Item
        label="Performance globale sur TALENT INNOVANT"
        value={calculatePerformance(user?.rang_general, user?.total_talent)}
      />

      <Item
        label="Niveau"
        value={
          <div className="flex items-center flex-wrap">
            <span className="font-semibold">{levelInfo.name}</span>
            {getStars(levelInfo.stars)}
            <span className="text-gray-500 font-normal text-sm">
              ({parseFloat(user?.points || 0).toFixed(2)} pts)
            </span>
          </div>
        }
      />

      <Item label="Région" value={user?.region} />
      <Item label="Ville" value={user?.city} />
      <Item label="Localisation" value={user?.location} />
      <Item label="Date d'adhésion à TALENT INNOVANT" value={formattedDate} />
    </div>
  );
}

function Item({ label, value, user }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-lg font-semibold text-gray-800">{value || "—"}</div>
      {label === "Domaine principal" && user?.domaine?.description && (
        <span className="text-sm text-gray-600">
          ({user.domaine.description})
        </span>
      )}
    </div>
  );
}
