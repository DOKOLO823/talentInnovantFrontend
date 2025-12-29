// components/entreprise/HomeClient.tsx
"use client";

import Link from "next/link";
import StatCard from "./StatCard";
import ChallengeCard from "../ChallengeCard";
import { Plus } from "lucide-react";

export default function HomeClient({ stats, challengesEnCours }: any) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Tableau de bord</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Challenges" value={stats.challenges} />
        <StatCard label="En cours" value={stats.enCours} />
        <StatCard label="Abonnés" value={stats.abonnes} />
        <StatCard label="Points" value={stats.points} />
        <StatCard label="Rang" value={stats.rang} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Vos challenges en cours</h3>
        <Link href="/home-entreprise/Challenges" className="text-orange-700 hover:underline">Voir plus</Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {challengesEnCours.map((c:any) => (
          <div key={c.id} className="flex-shrink-0 w-80">
            <ChallengeCard challenge={c} />
          </div>
        ))}
      </div>

      <div className="text-start space-y-4">
        <Link href="/challenge/create" className="inline-flex items-center gap-2 bg-orange-700 text-white px-5 py-3 rounded-lg">
          <Plus /> Organiser un challenge
        </Link>

        <h4 className="text-lg font-semibold mt-4">Comment organiser un challenge ?</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Step index={1} title="Cliquer sur Organiser" desc="Démarrez le processus en cliquant sur le bouton." />
          <Step index={2} title="Remplir & soumettre" desc="Renseignez toutes les informations du challenge." />
          <Step index={3} title="Évaluer" desc="Évaluez les projets reçus." />
          <Step index={4} title="Publier les résultats" desc="Annoncez les gagnants et félicitez les participants." />
        </div>

        <Link href="/opportunite/create" className="inline-flex items-center gap-2 border border-orange-700 text-orange-700 px-5 py-3 mt-5 rounded-lg">
          Publier une opportunité
        </Link>

        <h4 className="text-lg font-semibold mt-4">Comment publier une opportunité ?</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Step index={1} title="Cliquer sur Publier" desc="Commencez la création de l'offre." />
          <Step index={2} title="Remplir & soumettre" desc="Ajoutez titre, description, type." />
          <Step index={3} title="Évaluer les candidatures" desc="Sélectionnez les bons profils." />
          <Step index={4} title="Contacter les retenus" desc="Entrez en contact et embauchez." />
        </div>
      </div>
    </div>
  );
}

function Step({ index, title, desc }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 mx-auto flex items-center justify-center font-bold">{index}</div>
      <h5 className="font-semibold mt-3">{title}</h5>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}
