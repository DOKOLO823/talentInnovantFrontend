// components/StatsSection.tsx
"use client";
import { useEffect, useState } from "react";
import { Users, Building2, Rocket } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

export default function StatsSection() {
  const [stats, setStats] = useState<any>(null);

  // Fonction de formatage pour les grands nombres (1000 -> 1K, 1000000 -> 1M)
  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000000)
      return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "Md";
    if (num >= 1000000)
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch("/get-stats");
        if (response.statut === 200) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Erreur stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats || !stats.should_show) return null;

  const data = [
    {
      label: "Talents",
      // On applique le formatage sur le chiffre calculé
      value: `+${formatNumber(stats.talents - 1)}`,
      icon: Users,
    },
    {
      label: "Entreprise(s)",
      value: formatNumber(stats.entreprises),
      icon: Building2,
    },
    {
      label: "Challenges",
      value: formatNumber(stats.challenges),
      icon: Rocket,
    },
  ];

  return (
    <section className="relative mt-3 md:-mt-10 z-20 max-w-6xl mx-auto px-4">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl py-6 px-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center px-2 text-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon
                  size={18}
                  className="text-orange-700 hidden md:block"
                />
                <span className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {item.value}
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
