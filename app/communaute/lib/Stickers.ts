// Emplacement : app/communaute/lib/stickers.ts
//
// ╔══════════════════════════════════════════════════════════════════════╗
// ║  COMMENT AJOUTER UN STICKER (aucune modification du backend)         ║
// ╠══════════════════════════════════════════════════════════════════════╣
// ║  Option 1 : un emoji                                                 ║
// ║     { id: "ampoule", label: "Idée lumineuse", emoji: "💡" }          ║
// ║                                                                      ║
// ║  Option 2 : une image (PNG/WebP transparent, ~256x256)               ║
// ║     1. Déposez le fichier dans  public/stickers/merci.png            ║
// ║     2. Ajoutez la ligne :                                            ║
// ║        { id: "merci", label: "Merci", src: "/stickers/merci.png" }   ║
// ║                                                                      ║
// ║  Règles : id unique, en minuscules, chiffres, "-" ou "_" (max 40).   ║
// ║  Ne changez jamais l'id d'un sticker déjà utilisé.                   ║
// ╚══════════════════════════════════════════════════════════════════════╝

export interface Sticker {
  id: string;
  label: string;
  emoji?: string;
  src?: string;
}

export const STICKERS: Sticker[] = [
  { id: "idee", label: "Super idée", emoji: "💡" },
  { id: "fusee", label: "Ça décolle", emoji: "🚀" },
  { id: "bravo", label: "Bravo", emoji: "👏" },
  { id: "feu", label: "En feu", emoji: "🔥" },
  { id: "trophee", label: "Champion", emoji: "🏆" },
  { id: "etoile", label: "Excellent", emoji: "🌟" },
  { id: "force", label: "Force", emoji: "💪" },
  { id: "cerveau", label: "Génial", emoji: "🧠" },
  { id: "cible", label: "En plein dans le mille", emoji: "🎯" },
  { id: "coeur", label: "Coup de cœur", emoji: "💛" },
  { id: "innovation", label: "Innovation", emoji: "⚙️" },
  { id: "merci", label: "Merci", emoji: "🙏" },
];

export const getSticker = (id: string | null | undefined) =>
  STICKERS.find((s) => s.id === id) ?? null;