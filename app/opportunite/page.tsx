// /app/opportunites/page.tsx

import OpportunitesClient from "./OpportunitesClient";

const fakeOpps = [
  {
    id: 1,
    titre: "Développeur Full Stack",
    type: "Emploi",
    domaine: "Informatique",
    description: "Rejoignez une équipe dynamique pour construire des solutions innovantes.",
    date_limite: "2025-02-10",
    like: 12,
    lien: "#",
    entreprise: {
      nom: "TechLabs",
      logo: "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg",
    },
  },
  {
    id: 2,
    titre: "Stage en Marketing Digital",
    type: "Stage",
    domaine: "Marketing",
    description: "Stage de 3 mois pour participer à nos campagnes digitales.",
    date_limite: "2025-03-01",
    like: 8,
    lien: "#",
    entreprise: {
      nom: "MarketFit",
      logo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
    },
  },
  {
    id: 3,
    titre: "Programme Jeunes Leaders",
    type: "Autre",
    domaine: "Leadership",
    description: "Programme ouvert aux étudiants motivés souhaitant développer leur leadership.",
    date_limite: "2025-04-15",
    like: 4,
    lien: "#",
    entreprise: {
      nom: "ImpactCorp",
      logo: "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg",
    },
  },
  {
    id: 4,
    titre: "Backend Laravel Developer",
    type: "Emploi",
    domaine: "Informatique",
    description: "Développement d’API et optimisation des performances. Développement d’API et optimisation des performances. Développement d’API et optimisation des performances.",
    date_limite: "2025-02-28",
    like: 15,
    lien: "#",
    entreprise: {
      nom: "SoftDev",
      logo: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    },
  },
];

export function generateStaticParams() {
  return [{}]; // Obligatoire avec output: export
}

export default function Page() {
  return <OpportunitesClient opportunites={fakeOpps} />;
}
