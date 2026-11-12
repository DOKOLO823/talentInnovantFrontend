// Emplacement : app/lib/logout.ts
// Déconnexion complète. À appeler partout où l'utilisateur peut se déconnecter.

import { apiFetch } from "@/app/lib/api";
import { detachPushFromAccount } from "@/app/lib/push";

// Données liées au COMPTE, à effacer à la déconnexion.
// ➜ Si vous voyez d'autres clés de session dans F12 → Application → Local Storage
//   après une déconnexion, ajoutez-les ici.
const ACCOUNT_KEYS = ["auth", "lastLocationPrompt"];

// Volontairement conservés sur l'appareil : ti_push_optin_<id> et ti_push_modal_seen_<id>
// (le choix de chaque compte), ti_install_dismissed_at, et l'abonnement du navigateur.
// C'est ce qui évite de tout refaire à la reconnexion.

export async function logoutEverywhere(): Promise<void> {
  // 1. Détache l'appareil du compte (il n'y reçoit plus ses notifications).
  //    Doit passer AVANT la révocation du jeton.
  await detachPushFromAccount();

  // 2. Révoque le jeton côté serveur AVANT de le supprimer localement.
  //    Sans cet appel, le jeton reste valide dans la base même après la déconnexion.
  //    Ne bloque jamais la déconnexion plus de 3 secondes.
  try {
    await Promise.race([
      apiFetch("/logout", { method: "POST" }),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch {
    // Jeton déjà invalide ou réseau coupé : on continue la déconnexion locale
  }

  // 3. Efface la session locale
  try {
    ACCOUNT_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}
}