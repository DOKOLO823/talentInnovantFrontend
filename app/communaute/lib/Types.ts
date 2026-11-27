// Emplacement : app/communaute/lib/types.ts
import type { ReactionType } from "./Constants";

export interface Auteur {
  id: number;
  nom_complet: string;
  pp: string | null;
  profession: string | null;
  domaine_id: number | null;
  disponible: boolean;
}

export interface ReactionResume {
  type: ReactionType;
  count: number;
}

export interface ReactionState {
  ma_reaction: ReactionType | null;
  reactions_count: number;
  reactions_resume: ReactionResume[];
}

export interface PostFichier {
  id: number;
  type: "image" | "video";
  chemin: string;
}

export interface Post extends ReactionState {
  id: number;
  titre: string;
  description: string;
  lien: string | null;
  created_at: string;
  il_y_a: string;
  auteur: Auteur;
  fichiers: PostFichier[];
  commentaires_count: number;
  partages_count: number;
  est_auteur: boolean;
  peut_supprimer: boolean;
  peut_collaborer: boolean;
  peut_modifier: boolean;
}

export interface Commentaire extends ReactionState {
  id: number;
  post_id: number;
  parent_id: number | null;
  contenu: string | null;
  sticker: string | null;
  created_at: string;
  il_y_a: string;
  auteur: Auteur;
  reply_to: { id: number; nom_complet: string } | null;
  reponses_count: number;
}