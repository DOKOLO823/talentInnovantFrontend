"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // On attend que le store ait fini de lire le localStorage
    if (!loading) {
      if (user) {
        // L'utilisateur est connecté, on redirige selon son statut
        if (user.statut == 'entreprise') {
          router.push('/home-entreprise');
        } else if (user.statut == 'talent') {
          router.push('/home-talent');
        } else {
          router.push('/login');
        }
      } else {
        // Aucune donnée trouvée dans le store après chargement
        router.push('/home');
      }
    }
  }, [loading, user, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-12 w-12 text-orange-700 animate-spin" />
    </div>
  );
}