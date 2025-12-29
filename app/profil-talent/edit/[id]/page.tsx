// app/profil-talent/edit/[id]/page.tsx

import ProfilEditClient from "./ProfilEditClient";

// ===== FAKE DATA =====
const fakeUsers = [
  {
    id: 1,
    user: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      pp: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
      pc: "https://images.pexels.com/photos/3225525/pexels-photo-3225525.jpeg",
      telephone: 695002233,
      bio: "Développeur passionné par les solutions web modernes.",
    },
    talent: {
      nom: "Doe",
      prenom: "John",
      profession: "Développeur Full-Stack",
      domaine: "Informatique",
      competence: ["React", "Next.js", "Laravel", "MySQL"],
      region: "Littoral",
      ville: "Douala",
      localisation: "Douala, Littoral",
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Sarah Mba",
      email: "sarah@example.com",
      pp: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
      pc: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg",
      telephone: 679112233,
      bio: "Designer UI/UX créative et passionnée.",
    },
    talent: {
      nom: "Mba",
      prenom: "Sarah",
      profession: "UI/UX Designer",
      domaine: "Design numérique",
      competence: ["Figma", "Adobe XD", "Prototypage"],
      region: "Centre",
      ville: "Yaoundé",
      localisation: "Yaoundé, Centre",
    },
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Kevin Talla",
      email: "kevin@example.com",
      pp: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      pc: "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
      telephone: 677998822,
      bio: "Développeur mobile spécialisé en Flutter.",
    },
    talent: {
      nom: "Talla",
      prenom: "Kevin",
      profession: "Développeur Mobile",
      domaine: "Développement Mobile",
      competence: ["Flutter", "Dart", "Firebase"],
      region: "Ouest",
      ville: "Bafoussam",
      localisation: "Bafoussam, Ouest",
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

  const data = fakeUsers.find((u) => u.id.toString() === id);

  if (!data) return <p>Utilisateur introuvable</p>;

  return <ProfilEditClient user={data.user} talent={data.talent} />;
}
