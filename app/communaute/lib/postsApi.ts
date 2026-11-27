// Emplacement : app/communaute/lib/postsApi.ts
// Envoi / modification d'un projet (multipart) avec progression réelle.

import { API_BASE_URL } from "@/app/lib/api";
import { compressImage } from "./imageCompress";
import type { Post } from "./Types";

export interface NewPostData {
  titre: string;
  description: string;
  lien: string;
  fichiers: File[];
  retirer?: number[]; // modification : ids des fichiers existants à supprimer
}

function getToken(): string | null {
  try {
    return JSON.parse(localStorage.getItem("auth") || "{}")?.token ?? null;
  } catch {
    return null;
  }
}

async function construire(data: NewPostData): Promise<FormData> {
  const fichiers = await Promise.all(data.fichiers.map((f) => compressImage(f)));
  const form = new FormData();
  form.append("titre", data.titre.trim());
  form.append("description", data.description.trim());
  if (data.lien.trim()) form.append("lien", data.lien.trim());
  (data.retirer ?? []).forEach((id) => form.append("retirer[]", String(id)));
  fichiers.forEach((f) => form.append("fichiers[]", f));
  return form;
}

function envoyer(url: string, form: FormData, onProgress?: (pct: number | null) => void): Promise<Post> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${url}`);
    xhr.setRequestHeader("Accept", "application/json");
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Connexion perdue pendant l'envoi. Vérifiez votre réseau puis réessayez."));
    xhr.ontimeout = () => reject(new Error("Le serveur met trop de temps à répondre."));
    xhr.onload = () => {
      if (xhr.status === 401) return reject(new Error("Votre session a expiré. Reconnectez-vous puis réessayez."));
      if (xhr.status === 413) return reject(new Error("Les fichiers sont trop volumineux pour le serveur."));
      if (xhr.status === 429) return reject(new Error("Trop de tentatives. Réessayez dans une minute."));

      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {}
      if (!json) return reject(new Error("Réponse invalide du serveur."));
      if (json.statut !== 200) return reject(new Error(json.message || "Opération impossible."));
      resolve(json.data as Post);
    };

    xhr.send(form);
  });
}

export async function createPost(data: NewPostData, onProgress?: (pct: number | null) => void): Promise<Post> {
  onProgress?.(null);
  return envoyer("/communaute/posts", await construire(data), onProgress);
}

export async function updatePost(id: number, data: NewPostData, onProgress?: (pct: number | null) => void): Promise<Post> {
  onProgress?.(null);
  return envoyer(`/communaute/posts/${id}/modifier`, await construire(data), onProgress);
}