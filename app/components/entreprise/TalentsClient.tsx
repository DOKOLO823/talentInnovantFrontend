// components/entreprise/TalentsClient.tsx
"use client";

import { useState } from "react";
import TalentCard from "./TalentCard";
import ContactModal from "./ContactModal";


export default function TalentsClient({ talents }: any) {
  const tendances = talents.slice(0, 20);
  const autres = talents.slice(20);

  const [contact, setContact] = useState<any>(null);

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold">Les talents</h2>
        <p className="text-gray-500 mt-1">Trouvez des talents et contactez-les</p>
      </div>

      <section className="mb-6">
        <h3 className="font-semibold mb-3">Talents en tendances</h3>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {tendances.map((t:any) => (
            <div key={t.id} className="flex-shrink-0 w-64">
              <TalentCard talent={t} onContact={() => setContact(t)} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Autres talents</h3>
        <div className="flex flex-wrap gap-4">
          {autres.map((t:any) => (
            <div key={t.id} className="w-full md:w-[48%] lg:w-[31%]">
              <TalentCard talent={t} onContact={() => setContact(t)} />
            </div>
          ))}
        </div>
      </section>

      {contact && <ContactModal talent={contact} onClose={() => setContact(null)} />}
    </div>
  );
}
