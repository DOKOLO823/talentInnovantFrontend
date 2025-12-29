export const FORM_TEMPLATES = [
  {
    id: 1,
    title: "Hackathon Tech",
    description: "Idéal pour hackathons et challenges développeurs",
    fields: [
      { label: "Nom de l'équipe", type: "text", is_required: true },
      { label: "Liste des membres", type: "textarea", is_required: true },
      { label: "Nom du projet", type: "text", is_required: true },
      { label: "Description du projet", type: "textarea", is_required: true },
      { label: "Lien GitHub", type: "text", is_required: true },
      { label: "Vidéo démo", type: "video", is_required: true },
    ],
  },
  {
    id: 2,
    title: "Startup / Business",
    description: "Concours entrepreneuriat & innovation",
    fields: [
      { label: "Nom du projet", type: "text", is_required: true },
      { label: "Problème identifié", type: "textarea", is_required: true },
      { label: "Solution proposée", type: "textarea", is_required: true },
      { label: "Business model", type: "textarea", is_required: true },
      { label: "Business plan (PDF)", type: "file", is_required: true },
      { label: "Pitch deck", type: "file", is_required: true },
    ],
  },
  {
    id: 3,
    title: "Innovation sociale",
    description: "Projets à impact social",
    fields: [
      { label: "Nom du projet", type: "text", is_required: true },
      { label: "Communauté ciblée", type: "text", is_required: true },
      { label: "Impact attendu", type: "textarea", is_required: true },
      { label: "Zone géographique", type: "text", is_required: true },
      { label: "Document explicatif", type: "file", is_required: true },
    ],
  },
];
