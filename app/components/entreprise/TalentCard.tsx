// components/entreprise/TalentCard.tsx
"use client";

export default function TalentCard({ talent, onContact }: any) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 text-center">
      <img src={talent.avatar} alt={talent.name} className="w-16 h-16 rounded-full mx-auto" />
      <p className="font-semibold mt-3">{talent.name}</p>
      <span className="text-xs">{talent.profession}</span>
      <p className="text-sm text-gray-500 mt-1">{talent.points} pts</p>
      <div className="flex gap-2 mt-4">
        <button onClick={onContact} className="flex-1 bg-orange-700 text-white rounded py-2 text-sm">Contacter</button>
        <a href={`/profil-talent/${talent.id}`} className="flex-1 border rounded py-2 text-sm">Profil</a>
      </div>
    </div>
  );
}
