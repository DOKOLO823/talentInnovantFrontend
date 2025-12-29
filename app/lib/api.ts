export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * apiFetch - Version universelle
 * Gère automatiquement :
 * 1. L'injection du token Bearer (si disponible)
 * 2. Le type de contenu (JSON ou FormData)
 * 3. La gestion des erreurs
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  // 1. Récupération du token depuis le localStorage (format géré par votre AuthProvider)
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
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    // ⚠️ Très important : Ne PAS mettre Content-Type si c'est du FormData, 
    // le navigateur le fera automatiquement avec le "boundary" correct.
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Vérification si la réponse a du contenu avant de parser le JSON
    const contentType = res.headers.get("content-type");
    const data = contentType && contentType.includes("application/json") 
                 ? await res.json() 
                 : null;

    if (!res.ok) {
      // Gestion automatique de l'expiration du token (401)
      if (res.status === 401 && typeof window !== "undefined") {
        // Optionnel : redirection vers login ou logout si token expiré
        // localStorage.removeItem("auth");
        // window.location.href = "/login";
      }
      throw data || { message: "Une erreur est survenue" };
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}