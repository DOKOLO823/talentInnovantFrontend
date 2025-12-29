// ❌ PAS de "use client" ici

import ChallengeClient from "./ChallengeClient";

interface Props {
  params: { id: string };
}

// Obligatoire pour "output: export"
export async function generateStaticParams() {
  // Fake ids (remplace par les ids de ta BD plus tard)
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

export default function ChallengePage({ params }: Props) {
  const { id } = params;

  // Fake challenge pour passer au composant client
  const fakeChallenge = {
    id:1,
    title: "Olympiades mathématiques d'IA – Prix du progrès",
    image: "../assets/images/innov.jpg",
    theme:"Startup4Good",
    description:
      "Résoudre des défis mathématiques de niveau international à l'aide de modèles d'intelligence artificielle.",
    objectifs:
      "Créer des modèles capables de résoudre des problèmes de niveau olympique, améliorer le raisonnement mathématique.",
    start: "2025-02-01",
    end: "2025-08-20",
    inscriptionEnd: "2025-03-01",
    lieu: "En ligne",
    site: "Talent Innovant / Lien Zoom",
    participants: 230,
    typeevaluation: "vote",
    resultatdisponible:'oui'
  };

  return <ChallengeClient challenge={fakeChallenge} />;
}
