// app/home-entreprise/Challenges/page.tsx

import ChallengesClient from "@/app/components/entreprise/ChallengesClient";


export default function Page() {
  const challenges = [
    {
      id: 1,
      title: "Développement API sécurisée",
      image: "../../assets/images/award.jpg",
      locationType: "En ligne",
      startDate: "2025-03-01",
      endDate: "2025-03-10",
      participants: 50,
      rewards: ["1er: 2000€"],
      categories: ["Backend"],
      inscriptionEnd: "2025-02-20",
    },
    {
      id: 2,
      title: "Hackathon Mobile",
      image: "../../assets/images/innov.jpg",
      locationType: "Présentiel",
      startDate: "2025-04-05",
      endDate: "2025-04-12",
      participants: 80,
      rewards: ["1er: 3000€"],
      categories: ["Mobile"],
      inscriptionEnd: "2025-03-20",
    },
  ];

  return <ChallengesClient challenges={challenges} />;
}
