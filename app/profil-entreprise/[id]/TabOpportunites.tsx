import { useEffect, useState } from "react";
import { OpportuniteCard } from "@/app/components/opportunite/OpportuniteCard";
import { apiFetch } from "@/app/lib/api";
import BackToTop from "@/app/components/BackToTop";

export default function TabOpportunites({ id }: any) {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/ses-opportunite/${id}`).then((res) => {
      if (res.statut === 200) setOpps(res.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
      </div>
    );

  return (
    <div className="mb-12">
      {opps.length > 0 && (
        <h2 className="text-sm md:text-md text-gray-800 mb-6 border-l-4 border-orange-700 pl-3">
          Opportunités publiées par cette entreprise :
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {opps.length === 0 ? (
          <p className="text-gray-500 italic">
            Aucune opportunité disponible actuellement.
          </p>
        ) : (
          opps.map((opp: any) => <OpportuniteCard key={opp.id} opp={opp} />)
        )}
      </div>

      <BackToTop />
    </div>
  );
}
