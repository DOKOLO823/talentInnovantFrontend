// app/profil-entreprise/edit/[id]/page.tsx

import EntrepriseEditClient from "./EntrepriseEditClient";

// ===== FAKE DATA =====
const fakeEntreprises = [
  {
    id: 1,
    user: {
      id: 1,
      name: "TechCorp",
      email: "contact@techcorp.cm",
      pp: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      pc: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg",
      telephone: 697001122,
      bio: "Entreprise spécialisée dans les solutions digitales innovantes.",
    },
    entreprise: {
      nom: "TechCorp",
      domaine: "Informatique",
      service: "Développement web et mobile",
      description: "TechCorp propose des solutions web et mobile sur mesure pour les entreprises.",
      horaire: "08:00 - 17:00",
      siteweb: "https://www.techcorp.cm",
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "DesignPro",
      email: "contact@designpro.cm",
      pp: "https://images.pexels.com/photos/3184633/pexels-photo-3184633.jpeg",
      pc: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      telephone: 679223344,
      bio: "Agence spécialisée en design et branding.",
    },
    entreprise: {
      nom: "DesignPro",
      domaine: "Design",
      service: "Branding et UI/UX",
      description: "DesignPro accompagne les entreprises dans la création de leur identité visuelle.",
      horaire: "09:00 - 18:00",
      siteweb: "https://www.designpro.cm",
    },
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "AgroPlus",
      email: "contact@agroplus.cm",
      pp: "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg",
      pc: "https://images.pexels.com/photos/3184283/pexels-photo-3184283.jpeg",
      telephone: 677334455,
      bio: "Entreprise spécialisée dans l’agriculture moderne.",
    },
    entreprise: {
      nom: "AgroPlus",
      domaine: "Agriculture",
      service: "Production et distribution",
      description: "AgroPlus optimise la production agricole grâce aux nouvelles technologies.",
      horaire: "07:00 - 16:00",
      siteweb: "https://www.agroplus.cm",
    },
  },
];

// ⚠️ OBLIGATOIRE POUR output: "export"
export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = fakeEntreprises.find((e) => e.id.toString() === id);

  if (!data) return <p>Entreprise introuvable</p>;

  return <EntrepriseEditClient user={data.user} entreprise={data.entreprise} />;
}
