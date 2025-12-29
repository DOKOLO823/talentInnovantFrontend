"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import BackButton from "@/app/components/BackButton";

export default function EntrepriseEditClient({ user, entreprise }: any) {
  const [userData, setUserData] = useState({ ...user });
  const [entrepriseData, setEntrepriseData] = useState({ ...entreprise });

  const handleSubmit = () => {
    const payload = { user: userData, entreprise: entrepriseData };
    console.log("UPDATE ENTREPRISE PAYLOAD:", payload);
    alert("Modifications sauvegardées (démo) !");
  };

  return (
    <div className="w-full pb-20 bg-white">
       <BackButton m={4} />
      {/* COVER */}
      <div className="w-full h-56 md:h-72 relative bg-gray-100">
        <Image src={userData.pc} alt="cover" fill className="object-cover" />
        <label className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full cursor-pointer">
          <Camera size={18} />
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="px-6 -mt-20 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* PP */}
          <div className="relative">
            <img
              src={userData.pp}
              className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <label className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-full cursor-pointer">
              <Camera size={16} />
              <input type="file" className="hidden" />
            </label>
          </div>

          {/* FORMULAIRE */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow md:mt-24 w-full">
            <h2 className="text-xl font-bold mb-4">Modifier l'entreprise</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={entrepriseData.nom}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, nom: e.target.value })
                  }
                />
              </div>

              {/* Domaine */}
              <div>
                <label className="text-sm font-medium">Domaine</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={entrepriseData.domaine}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, domaine: e.target.value })
                  }
                />
              </div>

              {/* Service */}
              <div>
                <label className="text-sm font-medium">Service</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={entrepriseData.service}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, service: e.target.value })
                  }
                />
              </div>

              {/* Horaire */}
              <div>
                <label className="text-sm font-medium">Horaire</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={entrepriseData.horaire}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, horaire: e.target.value })
                  }
                />
              </div>

              {/* Site Web */}
              <div>
                <label className="text-sm font-medium">Site Web</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={entrepriseData.siteweb}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, siteweb: e.target.value })
                  }
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={userData.telephone}
                  onChange={(e) =>
                    setUserData({ ...userData, telephone: e.target.value })
                  }
                />
              </div>

              {/* Bio */}
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  rows={4}
                  value={userData.bio}
                  onChange={(e) =>
                    setUserData({ ...userData, bio: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  rows={4}
                  value={entrepriseData.description}
                  onChange={(e) =>
                    setEntrepriseData({ ...entrepriseData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-orange-700 text-white px-6 py-2 rounded-lg"
              >
                Enregistrer
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
