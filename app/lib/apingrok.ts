export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * apiFetch - Version universelle avec protection contre les pollutions HTML/ngrok
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  // 1. Récupération du token depuis le localStorage
  let token = null;
  const storedAuth = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
  
  if (storedAuth) {
    try {
      const authData = JSON.parse(storedAuth);
      token = authData.token;
    } catch (e) {
      console.error("Erreur lecture token", e);
    }
  }

  // 2. Détection du type de corps (Body)
  const isFormData = options.body instanceof FormData;

  // 3. Préparation des headers
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true', // Valeur standard 'true'
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 4. Récupération de la réponse en texte brut pour nettoyage
    const rawText = await res.text();
    let data = null;

    try {
      // On cherche le premier '{' et le dernier '}' pour extraire uniquement le JSON
      const firstBracket = rawText.indexOf('{');
      const lastBracket = rawText.lastIndexOf('}');

      if (firstBracket !== -1 && lastBracket !== -1) {
        const cleanedJson = rawText.substring(firstBracket, lastBracket + 1);
        data = JSON.parse(cleanedJson);
      } else {
        // Si aucun bracket n'est trouvé, le serveur n'a probablement pas renvoyé de JSON
        console.warn(`Pas de JSON détecté dans la réponse de [${endpoint}]`);
        data = null;
      }
    } catch (parseError) {
      console.error(`Erreur de parsing JSON sur [${endpoint}]. Contenu brut :`, rawText);
      throw { message: "La réponse du serveur est corrompue ou mal formatée." };
    }

    // 5. Gestion des erreurs HTTP
    if (!res.ok) {
      // Gestion de l'expiration du token (401)
      if (res.status === 401 && typeof window !== "undefined") {
        // Optionnel : localStorage.removeItem("auth");
        // window.location.href = "/login";
      }
      throw data || { message: `Erreur ${res.status}: Une erreur est survenue` };
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}