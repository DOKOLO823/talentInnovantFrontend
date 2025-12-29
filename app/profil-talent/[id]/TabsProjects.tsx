"use client";
import ProjectCardProfile from "@/app/components/cards/ProjectCardProfile";

const fakeProjects = [
  {
    id: 1,
    rank: 3,
    author: {
      id: 2,
      name: "DOKOLO Yvan",
      role: "Développeur Full-Stack",
      avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300",
    },
    challenge: {
      id: 1,
      name: "Orange Summer Challenge 2025",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=300",
      typeevaluation: "hybride",
      resultatdisponible: 'oui',
    },
    responses: [
      {
        id: 1,
        challenge_field: {
          label: "Description du projet",
          type: "text",
        },
        value:
          "Mokine est une plateforme intelligente permettant la gestion et le suivi des équipes de travail.",
      },
      {
        id: 2,
        challenge_field: {
          label: "Image principale",
          type: "file",
        },
        value: "../../assets/images/innov.jpg",
      },
      {
        id: 3,
        challenge_field: {
          label: "Vidéo de présentation",
          type: "file",
        },
        value: "uploads/projects/demo.mp4",
      },
    ],
  },

  {
    id: 2,
    rank: 12,
    author: {
      id: 3,
      name: "FOTSA NGUIMDJO",
      role: "Mobile Developer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    },
    challenge: {
      id: 2,
      name: "Hackathon Cloud & AI",
      image: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=300",
      typeevaluation: "hybride",
      resultatdisponible: 'oui',
    },
    responses: [
      {
        id: 4,
        challenge_field: {
          label: "Pitch",
          type: "text",
        },
        value:
          "MaxiPlay est une appli mobile de jeux interactifs avec leaderboard dynamique.",
      },
      {
        id: 5,
        challenge_field: {
          label: "Document PDF",
          type: "file",
        },
        value: "uploads/projects/specifications.pdf",
      },
    ],
  },
];

export default function ProjectsTab() {
  return (
    <div className="space-y-6 mt-4 mb-12">
      {fakeProjects.map((project) => (
        <ProjectCardProfile key={project.id} project={project} />
      ))}
    </div>
  );
}
