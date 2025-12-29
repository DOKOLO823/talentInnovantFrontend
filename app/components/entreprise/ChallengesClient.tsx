// components/entreprise/ChallengesClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import ChallengeCard from "../ChallengeCard";

export default function ChallengesClient({ challenges }: any) {
  const tabs = ["En cours", "Terminés", "À venir"];
  const [active, setActive] = useState(tabs[0]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return challenges.filter((c:any) => c.title.toLowerCase().includes(query.toLowerCase()));
  }, [challenges, query]);

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow mb-4">
        <h2 className="text-2xl font-bold">Vos challenges</h2>
        <p className="text-gray-500 mt-1">Gérez vos challenges et suivez l'activité</p>
        <div className="mt-4">
          <Link href="/challenge/create" className="bg-orange-700 text-white px-4 py-2 rounded">Organiser un challenge</Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="flex gap-3">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActive(t)} className={`px-3 py-2 rounded ${active===t ? 'bg-orange-50 text-orange-700' : 'text-gray-600'}`}>{t}</button>
          ))}
          <div className="ml-auto max-w-md w-full relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input className="pl-10 p-2 border rounded w-full" placeholder="Rechercher un challenge..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {filtered.map((c:any) => (
          <div key={c.id} className="w-full md:w-[48%] lg:w-[31%]">
            <ChallengeCard challenge={c} />
          </div>
        ))}
      </div>
    </div>
  );
}
