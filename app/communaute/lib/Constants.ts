// Emplacement : app/communaute/lib/constants.ts
// Constantes partagées par toute la communauté.

// Réactions (doivent correspondre à CommunautePresenter::REACTIONS côté Laravel)
export const REACTIONS = [
  { type: "like", label: "J'aime", emoji: "👍", color: "text-blue-600" },
  { type: "love", label: "J'adore", emoji: "❤️", color: "text-red-500" },
  { type: "bravo", label: "Bravo", emoji: "👏", color: "text-amber-600" },
  { type: "wow", label: "Waouh", emoji: "😮", color: "text-amber-600" },
  { type: "haha", label: "Haha", emoji: "😂", color: "text-amber-600" },
  { type: "sad", label: "Triste", emoji: "😢", color: "text-amber-600" },
] as const;

export type ReactionType = (typeof REACTIONS)[number]["type"];

export const reactionOf = (type: string | null | undefined) =>
  REACTIONS.find((r) => r.type === type) ?? null;

// Limites d'envoi (identiques côté Laravel : CommunautePostController)
export const LIMITS = {
  maxFiles: 6,
  maxImageMb: 5,
  maxVideoMb: 30,
  maxTotalMb: 60,
  titre: 150,
  description: 2000,
  commentaire: 1000,
};

export const REPORT_REASONS = [
  { value: "spam", label: "Spam ou publicité" },
  { value: "inapproprie", label: "Contenu inapproprié" },
  { value: "harcelement", label: "Harcèlement ou propos haineux" },
  { value: "fausse_information", label: "Fausse information" },
  { value: "autre", label: "Autre" },
];

export const postUrl = (id: number | string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/communaute/projets/${id}`;