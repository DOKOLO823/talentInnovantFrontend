// app/home-entreprise/page.tsx

import HomeClient from "../components/entreprise/HomeClient";

export default function Page() {
  const stats = {
    challenges: 18,
    enCours: 4,
    abonnes: 1280,
    points: 8420,
    rang: "2e"
  };

  const challengesEnCours = [
    {
      id: 1,
      title: "Hackathon IA 2025",
      image: "../../assets/images/award.jpg",
      locationType: "En ligne",
      site: "TechCorp",
      startDate: "2025-06-01",
      endDate: "2025-06-15",
      participants: 120,
      rewards: ["1er: 5 000€", "2e: 2 500€"],
      categories: ["IA"],
      inscriptionEnd: "2025-05-25",
    },
    {
      id: 2,
      title: "Challenge Sécurité",
      image: "../../assets/images/innov.jpg",
      locationType: "Présentiel",
      site: "TechCorp",
      startDate: "2025-04-10",
      endDate: "2025-04-20",
      participants: 60,
      rewards: ["1er: 3 000€"],
      categories: ["Sécurité"],
      inscriptionEnd: "2025-04-01",
    },
  ];

  return <HomeClient stats={stats} challengesEnCours={challengesEnCours} />;
}
