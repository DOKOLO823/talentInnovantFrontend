"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Target,
  LayoutDashboard,
  TrendingUp,
  Loader2,
  Rocket,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";

const ORANGE_700 = "#C2410C";
const COLORS = [ORANGE_700, "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

interface StatsData {
  summary: {
    total_participants_actifs: number;
    total_talents_domaine: number;
    taux_participation: number;
    total_projets_soumis: number; // Ajouté ici
  };
  registrationData: Array<{ day: string; count: number }>;
  domaineData: Array<{ name: string; value: number }>;
}

export default function ChallengeAnalytics({
  challengeId,
}: {
  challengeId: number;
}) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/challenge/stats/${challengeId}`, {
        method: "GET",
      });

      if (res?.statut === 200) {
        setData(res.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Erreur stats:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    if (challengeId) {
      fetchStats();
    }
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-orange-700" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Chargement des analyses...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600 font-medium">
          Impossible de charger les statistiques du challenge.
        </p>
        <button
          onClick={fetchStats}
          className="mt-4 text-sm font-semibold text-red-700 underline underline-offset-4"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 py-6">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <LayoutDashboard className="text-orange-700" size={24} />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Statistiques de performance du challenge
        </h2>
      </div>

      {/* TOP CARDS: QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Participants Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Participants
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {data.summary.total_participants_actifs}
              </h3>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <Users size={20} className="text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-orange-700 text-sm font-medium">
            <TrendingUp size={16} className="mr-1" /> En cours
          </div>
        </div>

        {/* PROJETS SOUMIS - NOUVELLE CARTE */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Projets Soumis
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {data.summary.total_projets_soumis}
              </h3>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <Rocket size={20} className="text-slate-800" />
            </div>
          </div>
          <div className="mt-4 text-slate-400 text-xs font-medium">
            Solutions déposées
          </div>
        </div>

        {/* Taux de participation */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Taux de participation
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {data.summary.taux_participation}%
              </h3>
            </div>
            <Target size={20} className="text-orange-700" />
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-700 transition-all duration-1000 ease-out"
              style={{ width: `${data.summary.taux_participation}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {data.summary.total_participants_actifs} talents ont rejoint sur{" "}
            {data.summary.total_talents_domaine} talents identifiés dans les
            domaines de ce challenge
          </p>
        </div>
      </div>

      {/* GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LINE CHART: EVOLUTION */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-700 rounded-full" />
            Évolution des inscriptions (Timeline)
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.registrationData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={ORANGE_700}
                  strokeWidth={3}
                  dot={{
                    r: 6,
                    fill: ORANGE_700,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: DOMAINES */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-700 rounded-full" />
            Répartition par domaine technique
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.domaineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.domaineData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
