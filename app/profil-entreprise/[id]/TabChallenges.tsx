import { useEffect, useState } from "react";
import ChallengeCard from "@/app/components/ChallengeCard";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackToTop from "@/app/components/BackToTop";

export default function TabChallenges({ id, isOwner }: any) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/entreprise/tous-mes-challenges/${id}`).then((res) => {
      if (res.statut === 200 && res.challenges) {
        
        const formatted = res.challenges.map((c: any) => {
          // Gestion des récompenses (Format JSON vers Array)
          let rewardsArray = ["Prix non défini"];
          try {
            if (typeof c.recompense === 'string' && c.recompense !== 'null') {
              const parsed = JSON.parse(c.recompense);
              rewardsArray = Object.values(parsed);
            } else if (Array.isArray(c.recompense)) {
              rewardsArray = c.recompense;
            }
          } catch (e) { 
            console.error("Erreur rewards:", e); 
          }

          // Mapping strict sur le format attendu par ChallengeCard
          return {
            id: c.id,
            user_id: c.user_id,
            title: c.titre,
            image: c.photo ? `${apifile}/${c.photo}` : "../assets/images/innov.jpg",
            locationType: c.lieu || "",
            site: c.site || "",
            startDate: c.datelancement,
            endDate: c.datefin,
            inscriptionEnd: c.datefininscription,
            participants: c.nombrecompetiteur || 0,
            rewards: rewardsArray,
            // Mapping des catégories/domaines
            categories: c.domaines && c.domaines.length > 0 
              ? c.domaines.map((d: any) => d.nom) 
              : ["Général"],
            // Infos Entreprise
            entrepriseNom: c.user?.entreprise?.nom || "",
            entrepriseLogo: c.user?.pp ? `${apifile}/${c.user.pp}` : "/assets/images/ppe.png",
            entrepriseId: c.user?.id || c.user_id,
            portee: c['portee']?.portee,
          };
        });

        // Filtrage si ce n'est pas le propriétaire (masquer les challenges privés/brouillons)
        // const list = isOwner ? formatted : formatted.filter((c: any) => c?.portee != 'privee');
        // setChallenges(list);
        setChallenges(formatted)
        
      }
      setLoading(false);
    });
  }, [id, isOwner]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  return (
   <div className="mb-12">
  {challenges.length > 0 && (
    <h2 className="text-sm md:text-md text-gray-800 mb-6 border-l-4 border-orange-700 pl-3">
      Challenges publiés par cette entreprise :
    </h2>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {challenges.length === 0 ? (
      <p className="text-gray-500 italic">Aucun challenge disponible.</p>
    ) : (
      challenges.map((ch: any) => (
        <ChallengeCard key={ch.id} challenge={ch} />
      ))
    )}
  </div>

  <BackToTop/>
</div>
  );
}