import PortfolioClient from "./PortfolioClient";

interface Portfolio {
  id: number;
  user: {
    name: string;
    profession: string;
    avatar: string;
  };
  projects: {
    id: number;
    titre: string;
    description: string;
    technologie: string[];
    year: number;
    link?: string;
    medias?: string[];
  }[];
}

// FAKE DATA
const portfolios: Portfolio[] = [
  {
    id: 1,
    user: {
      name: "John Doe",
      profession: "Développeur Full-Stack",
      avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
    },
    projects: [
      {
        id: 1,
        titre: "Application de gestion scolaire",
        description: "Plateforme pour gérer élèves, professeurs et emplois du temps.",
        technologie: ["Laravel", "React", "MySQL"],
        year: 2024,
        link: "https://myproject.example.com",
        medias: [
          "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
          "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg",
        ],
      },
      {
        id: 2,
        titre: "Système de vote électronique",
        description: "Outil sécurisé permettant un vote anonyme chiffré.",
        technologie: ["Node.js", "Next.js", "PostgreSQL"],
        year: 2023,
        medias: ["https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg"],
      },
    ],
  },
];

// ⚠️ IMPORTANT: Next.js 13+ App Router utilise `params` provenant des props
export default function PortfolioPage({ params }: { params: { id: string } }) {
  console.log("Server params.id:", params.id); // pour debug

  const portfolio = portfolios.find(p => p.id.toString() == '1');

  if (!portfolio) return <p>Portfolio non trouvé</p>;

  return <PortfolioClient portfolio={portfolio} />;
}

// ⚠️ Si tu veux le build statique pour `output: export`
export async function generateStaticParams() {
  return portfolios.map(p => ({
    id: p.id.toString(),
  }));
}
