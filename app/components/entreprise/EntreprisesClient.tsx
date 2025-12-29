// components/entreprise/EntreprisesClient.tsx
"use client";

import EntrepriseCard from "./EntrepriseCard";

export default function EntreprisesClient({ entreprises }: any) {
  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold">Les entreprises</h2>
        <p className="text-gray-500 mt-1">Découvrez et abonnez-vous aux entreprises</p>
      </div>

      <section className="mb-6">
        <h3 className="font-semibold mb-3">Entreprises en tendances</h3>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {entreprises.slice(0,10).map((c:any) => (
            <div key={c.id} className="flex-shrink-0 w-64">
              <EntrepriseCard c={c} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Toutes les entreprises</h3>
        <div className="flex flex-wrap gap-4">
          {entreprises.map((c:any) => (
            <div key={c.id} className="w-full md:w-[48%] lg:w-[31%]">
              <EntrepriseCard c={c} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
