// components/entreprise/EntrepriseCard.tsx
"use client";

export default function EntrepriseCard({ c }: any) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 text-center">
      <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-full mx-auto" />
      <p className="font-semibold mt-3">{c.name}</p>
      <p className="text-sm text-gray-500">{c.score} pts</p>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-orange-700 text-white rounded py-2 text-sm">S’abonner</button>
        <a href={`/profil-entreprise/${c.id}`} className="flex-1 border rounded py-2 text-sm">Profil</a>
      </div>
    </div>
  );
}
