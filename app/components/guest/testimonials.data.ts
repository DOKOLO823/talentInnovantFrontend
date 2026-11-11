// Emplacement : app/components/guest/testimonials.data.ts
//
// Pour ajouter un témoignage : ajouter un objet dans le tableau TESTIMONIALS.
// Aucun autre fichier à modifier. L'ordre du tableau = l'ordre d'affichage.
//
// Trois formats possibles (champ "type") :
//   - "video" : fournir "videoSrc" (fichier mp4 dans /public) OU "youtubeId"
//   - "image" : fournir "image"
//   - "text"  : fournir "quote" (la photo "image" est facultative, sinon initiales)
//
// Champs communs : name (obligatoire), title (obligatoire, ex. "Vainqueur du hackathon"),
// subtitle (facultatif), quote (facultatif sauf pour "text").

export type TestimonialType = "video" | "image" | "text";

export interface Testimonial {
  id: string;
  type: TestimonialType;
  name: string;
  /** Distinction / rôle, affiché en pastille. Ex : "1ère place du Hackathon" */
  title: string;
  /** Précision facultative. Ex : "Hackathon Talent Innovant 2025" */
  subtitle?: string;
  /** Citation facultative (obligatoire pour le type "text") */
  quote?: string;

  /** Type "video" : fichier local (dans /public) */
  videoSrc?: string;
  /** Type "video" : identifiant YouTube (alternative à videoSrc) */
  youtubeId?: string;
  /** Type "video" : miniature facultative (sinon image extraite de la vidéo) */
  poster?: string;

  /** Type "image" : photo du talent. Type "text" : avatar facultatif */
  image?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "adjam-kamni",
    type: "video",
    name: "Adjam Kamni",
    title: "Vainqueur d'un challenge d'innovation",
    subtitle: "Challenge organisé sur TALENT INNOVANT",
    videoSrc: "/assets/testimonials/adjam-kamni.mp4",
    // poster: "/assets/testimonials/adjam-kamni.jpg", // facultatif
  },
  {
    id: "nze-mekou",
    type: "image",
    name: "Nze Mekou",
    title: "1ère place du Hackathon",
    subtitle: "Hackathon organisé sur TALENT INNOVANT",
    image: "/assets/testimonials/nze-mekou.jpg",
  },

  // ---- Exemples à copier / adapter ----
  // {
  //   id: "exemple-texte",
  //   type: "text",
  //   name: "Prénom Nom",
  //   title: "Talent récompensé",
  //   quote: "Votre citation ici.",
  // },
  // {
  //   id: "exemple-youtube",
  //   type: "video",
  //   name: "Prénom Nom",
  //   title: "Lauréat",
  //   youtubeId: "dQw4w9WgXcQ",
  // },
];