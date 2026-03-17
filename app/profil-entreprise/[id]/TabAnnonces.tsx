"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import AnnonceCard from "@/app/components/entreprise/cards/AnnonceCard";
import BackToTop from "@/app/components/BackToTop";

export default function TabAnnonces({ userId }: { userId: string }) {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnonces = () => {
    setLoading(true);
    apiFetch(`/annonces/entreprise/${userId}`)
      .then((res) => {
        if (res.statut === 200) {
          setAnnonces(res.data || []);
        }
      })
      .catch((err) => console.error("Erreur annonces:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnonces();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {annonces.length > 0 && (
        <h2 className="text-sm md:text-md text-gray-800 mb-6 border-l-4 border-orange-700 pl-3">
          Annonces publiées par cette entreprise :
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {annonces.length === 0 ? (
          <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 italic font-medium">
              Cette entreprise n'a pas encore publié d'annonces.
            </p>
          </div>
        ) : (
          annonces.map((annonce: any) => (
            <AnnonceCard
              key={annonce.id}
              annonce={annonce}
              onDeleteSuccess={fetchAnnonces}
              currentUserId={userId}
              onEdit={() => {}} // À implémenter si nécessaire
            />
          ))
        )}
      </div>

      <BackToTop />
    </div>
  );
}
