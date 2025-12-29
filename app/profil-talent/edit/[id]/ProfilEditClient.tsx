"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import BackButton from "@/app/components/BackButton";

export default function ProfilEditClient({ user, talent }: any) {
  const [userData, setUserData] = useState({ ...user });

  // Parse initial localisation
  const parsed = useMemo(() => {
    if (!talent?.localisation)
      return { region: talent.region || "", ville: talent.ville || "" };

    const parts = talent.localisation.split(",").map((x:any) => x.trim());
    return {
      ville: parts[0] || "",
      region: parts[1] || "",
    };
  }, [talent]);

  const [talentData, setTalentData] = useState({
    ...talent,
    region: parsed.region,
    ville: parsed.ville,
  });

  const regions = [
    "Adamaoua",
    "Centre",
    "Est",
    "Extrême-Nord",
    "Littoral",
    "Nord",
    "Nord-Ouest",
    "Ouest",
    "Sud",
    "Sud-Ouest",
  ];

  const villesParRegion: Record<string, string[]> = {
    "Adamaoua": ["Ngaoundéré", "Tignère", "Meiganga"],
    "Centre": ["Yaoundé", "Obala", "Mfou", "Mbalmayo"],
    "Est": ["Bertoua", "Batouri", "Garoua-Boulaï"],
    "Extrême-Nord": ["Maroua", "Kousseri", "Mokolo"],
    "Littoral": ["Douala", "Manjo", "Nkongsamba"],
    "Nord": ["Garoua", "Guider", "Poli"],
    "Nord-Ouest": ["Bamenda", "Kumbo", "Ndop"],
    "Ouest": ["Bafoussam", "Dschang", "Foumban", "Bangangté"],
    "Sud": ["Ebolowa", "Kribi", "Ambam"],
    "Sud-Ouest": ["Buea", "Limbe", "Kumba"],
  };

  const villesDisponibles = villesParRegion[talentData.region] || [];

  useEffect(() => {
    if (!villesDisponibles.includes(talentData.ville)) {
      setTalentData((p:any) => ({
        ...p,
        ville: villesDisponibles[0] || "",
      }));
    }
  }, [talentData.region]);

  const handleSubmit = () => {
    const localisation =
      talentData.ville && talentData.region
        ? `${talentData.ville}, ${talentData.region}`
        : "";

    const payload = {
      user: userData,
      talent: { ...talentData, localisation },
    };

    console.log("UPDATE PROFILE PAYLOAD:", payload);
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
            <h2 className="text-xl font-bold mb-4">Modifier le profil</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NOM */}
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={talentData.nom}
                  onChange={(e) =>
                    setTalentData({ ...talentData, nom: e.target.value })
                  }
                />
              </div>

              {/* PRENOM */}
              <div>
                <label className="text-sm font-medium">Prénom</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={talentData.prenom}
                  onChange={(e) =>
                    setTalentData({ ...talentData, prenom: e.target.value })
                  }
                />
              </div>

              {/* PROFESSION */}
              <div>
                <label className="text-sm font-medium">Profession</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={talentData.profession}
                  onChange={(e) =>
                    setTalentData({ ...talentData, profession: e.target.value })
                  }
                />
              </div>

              {/* DOMAINE */}
              <div>
                <label className="text-sm font-medium">Domaine</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={talentData.domaine}
                  onChange={(e) =>
                    setTalentData({ ...talentData, domaine: e.target.value })
                  }
                />
              </div>

              {/* REGION */}
              <div>
                <label className="text-sm font-medium">Région</label>
                <select
                  className="mt-1 w-full border bg-white rounded px-3 py-2"
                  value={talentData.region}
                  onChange={(e) =>
                    setTalentData({ ...talentData, region: e.target.value })
                  }
                >
                  <option value="">-- Choisir une région --</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* VILLE */}
              <div>
                <label className="text-sm font-medium">Ville</label>
                <select
                  className="mt-1 w-full border bg-white rounded px-3 py-2"
                  value={talentData.ville}
                  onChange={(e) =>
                    setTalentData({ ...talentData, ville: e.target.value })
                  }
                >
                  <option value="">-- Choisir une ville --</option>
                  {villesDisponibles.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* TELEPHONE */}
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

              {/* LOCALISATION TEXT */}
              <div>
                <label className="text-sm font-medium">Localisation</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={talentData.localisation}
                  onChange={(e) =>
                    setTalentData({
                      ...talentData,
                      localisation: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* BIO */}
            <div className="mt-4">
              <label className="text-sm font-medium">Biographie</label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2"
                rows={4}
                value={userData.bio}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
              />
            </div>

            {/* COMPETENCES */}
            <div className="mt-4">
              <label className="text-sm font-medium">Compétences</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={talentData.competence.join(", ")}
                onChange={(e) =>
                  setTalentData({
                    ...talentData,
                    competence: e.target.value
                      .split(",")
                      .map((t) => t.trim()),
                  })
                }
              />
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
