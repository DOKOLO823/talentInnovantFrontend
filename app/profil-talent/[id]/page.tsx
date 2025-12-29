// app/profil-talent/[id]/page.tsx

import ProfileClient from "./ProfileClient";

// OBLIGATOIRE POUR output: export
export function generateStaticParams() {
  // Fake IDs TEMPORAIRES
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  // ==========================
  // FAKE USER (en attendant la BD)
  // ==========================
  const fakeUser = {
    id,
    name: "Yvan Dokolo",
    profession: "Full Stack Developer",
    bio: "Passionné par le développement mobile, l’IA et les compétitions tech.",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300",
    cover:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200",
    competence: ["React", "Next.js", "Laravel", "Tailwind"],
    points: 450,
    trophees: 3,
    region: "Extrême-Nord",
    ville: "Maroua",
    localisation: "Maroua, Cameroun",
  };

  // ==========================
  // FAKE PROJECTS
  // ==========================
  const fakeProjects = [
    {
      id: 1,
      rank: 3,
      author: {
        name: "Yvan Dokolo",
        role: "Développeur",
        avatar:
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200",
      },
      challenge: {
        id: 1,
        name: "Orange Summer Challenge",
        image:
          "https://images.unsplash.com/photo-1581091012184-5c7a9d5cdc52?w=200",
          typeevaluation: "hybride",
          resultatdisponible: 'oui',
      },
      responses: [
        {
          id: 1,
          challenge_field: { label: "Description", type: "text" },
          value: "Un projet innovant utilisant l'IA.",
        },
        {
          id: 2,
          challenge_field: { label: "Pitch", type: "text" },
          value: "Améliorer le transport grâce à l'intelligence artificielle.",
        },
      ],
    },
  ];

  // ==========================
  // FAKE PORTFOLIO
  // ==========================
  const fakePortfolio = [
    {
      id: 1,
      titre: "Mokine",
      description: "Plateforme éducative gamifiée.",
      technologie: ["React", "Laravel", "MySQL"],
      medias: [
        "https://images.unsplash.com/photo-1557093794-8ecb1e60d06b?w=400",
      ],
      year: 2024,
      link: "#",
    },
    {
      id: 2,
      titre: "MaxiPlay",
      description: "Application mobile de streaming.",
      technologie: ["React Native", "Node.js"],
      medias: [
        "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400",
      ],
      year: 2023,
      link: "#",
    },
  ];

  return (
    <ProfileClient
      user={fakeUser}
      projects={fakeProjects}
      portfolio={fakePortfolio}
    />
  );
}
