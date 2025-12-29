// app/profil-entreprise/[id]/page.tsx

import EntrepriseProfileClient from "./EntrepriseProfileClient";

// OBLIGATOIRE POUR output: export
export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  // ==========================
  // FAKE ENTREPRISE
  // ==========================
  const fakeEntreprise = {
    id,
    name: "TechNova SARL",
    service: "Développement logiciel & IA",
    description:
      "TechNova est une entreprise spécialisée dans les solutions numériques avancées, les systèmes d'analyse et l’intelligence artificielle.",
    avatar:
      "https://images.unsplash.com/photo-1560264418-c4445382edbc?w=300",
    cover:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1200",
    horaires: "Lundi - Vendredi : 08h - 17h",
    siteWeb: "https://technova.example.com",
    points: 920,
  };

  // ==========================
  // FAKE CHALLENGES
  // ==========================
  const fakeChallenges = [
    {
      id: 1,
      title: "Challenge IA Cameroun 2025",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600",
      locationType: "En ligne",
      site: "Maroua",
      startDate: "01 Juin",
      endDate: "30 Juin",
      inscriptionEnd: "20 Mai",
      participants: 240,
      rewards: ["500 000 FCFA", "Stage", "Certificat"],
      categories: ["IA", "Innovation", "Data Science"],
    },
    {
      id: 2,
      title: "Hackathon FinTech Africa",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
      locationType: "Présentiel",
      site: "Douala",
      startDate: "15 Avril",
      endDate: "17 Avril",
      inscriptionEnd: "10 Avril",
      participants: 150,
      rewards: ["1 000 000 FCFA", "Contrat freelance"],
      categories: ["Finance", "App Mobile"],
    },
  ];

  // ==========================
  // FAKE OPPORTUNITÉS
  // ==========================
  const fakeOpportunites = [
    {
      id: 1,
      titre: "Stage en Développement Web",
      description:
        "Rejoignez notre équipe pour travailler sur des projets React & Laravel.",
      lien: "#",
      type: "Stage",
      domaine: "Développement",
      like: 42,
      date_limite: "30 Juin 2026",
      entreprise:{
        logo:'../assets/images/innov.jpg',
        nom:'TechNova SARL'
      }
    },
    {
      id: 2,
      titre: "Offre d'emploi : Data Scientist",
      description:
        "Nous recherchons un Data Scientist maîtrisant Python et le Machine Learning, Nous recherchons un Data Scientist maîtrisant Python et le Machine Learning; Nous recherchons un Data Scientist maîtrisant Python et le Machine Learning.",
      lien: "#",
      type: "Emploi",
      domaine: "IA & Data",
      like: 87,
      date_limite: "15 Juillet 2026",
       entreprise:{
        logo:'../assets/images/innov.jpg',
        nom:'TechNova SARL'
      }
    },
  ];

  return (
    <EntrepriseProfileClient
      entreprise={fakeEntreprise}
      challenges={fakeChallenges}
      opportunites={fakeOpportunites}
    />
  );
}
