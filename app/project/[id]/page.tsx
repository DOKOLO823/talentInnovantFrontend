// app/project/[id]/page.tsx

import ProjectDetailClient from "./ProjectDetailClient";

type Params = { id: string };

export async function generateStaticParams() {
  const mockIds = ["42", "43", "44"];
  return mockIds.map((id) => ({ id }));
}

export default async function Page({ params }: { params: Params }) {
  const { id } = params;

  // 💡 Les données doivent contenir tous les champs requis par ProjectDetailClient,
  // sinon l'affichage conditionnel (Rang, Jury, Boutons de vote) ne fonctionnera pas.
  const mockProject = {
    id,
    title: "Détection intelligente du bétail",
    author: { id: 7, name: "Yvan Dokolo", role: "Ingénieur IA", avatar: "/img/avatar1.png" },
    
    // ===============================================================
    // 🚨 AJOUT DES CHAMPS MANQUANTS POUR L'AFFICHAGE DU RANG ET DU JURY
    // ===============================================================
    
    // 1. Affichage du rang et des points (isResultPublished = true pour l'activer)
    isResultPublished: true, 
    rank: 1,
    points: 420,
    totalPosts: 50, // Nécessaire pour afficher le rang (ex: 1/50)
    
    // 2. Commentaire du Jury
    juryComment: "Ce projet est un excellent exemple de l'application de l'IA aux défis agricoles. Bravo à l'équipe!",
    
    // 3. Données d'interaction (pour les compteurs)
    votesCount: 987,
    commentCount: 12,
    hasVoted: false, // L'utilisateur courant n'a pas voté
    
    // Contenu dynamique
    responses: [
      { id: 3, challenge_field: { label: "Nom du projet", type: "text" }, value: "SafeCow — détection et suivi du bétail" },
      { id: 4, challenge_field: { label: "Pitch (PDF)", type: "file" }, value: "challengepostfiles/sample-pitch.pdf" },
      { id: 5, challenge_field: { label: "Démo vidéo", type: "file" }, value: "challengepostfiles/demo.mp4" },
 { id: 6, challenge_field: { label: " Image illustrative", type: "file" }, value: "../../assets/images/award.jpg" },
      { id: 7, challenge_field: { label: "Petite explication", type: "text" }, value: "Tres performant" },
    ],
    preview: "/images/project-thumb.jpg",
    created_at: "2025-11-05T10:00:00Z",
  };

  // Rendu du composant client (interactif)
  return <ProjectDetailClient project={mockProject} />;
}