"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import domaines from "@/domaines.json";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

const CAMEROON_GEO = {
  Adamaoua: ["Ngaoundéré", "Tignère", "Meiganga", "Banyo", "Tibati"],
  Centre: ["Yaoundé", "Obala", "Mfou", "Mbalmayo", "Akonolinga", "Eseka"],
  Est: ["Bertoua", "Batouri", "Garoua-Boulaï", "Abong-Mbang"],
  "Extrême-Nord": ["Maroua", "Kousseri", "Mokolo", "Mora", "Yagoua"],
  Littoral: ["Douala", "Nkongsamba", "Edea", "Manjo", "Loum"],
  Nord: ["Garoua", "Guider", "Poli", "Figuil"],
  "Nord-Ouest": ["Bamenda", "Kumbo", "Ndop", "Wum"],
  Ouest: ["Bafoussam", "Dschang", "Foumban", "Bangangté", "Mbouda", "Baham"],
  Sud: ["Ebolowa", "Kribi", "Ambam", "Sangmelima"],
  "Sud-Ouest": ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko"],
};

export default function ProfilEditClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [talentData, setTalentData] = useState<any>(null);
  const [domainesSecondaires, setDomainesSecondaires] = useState<number[]>([]);

  // États pour la prévisualisation et fichiers
  const [ppFile, setPpFile] = useState<File | null>(null);
  const [pcFile, setPcFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState({ pp: "", pc: "" });

  const defaultPP = "/assets/images/pp2.png";
  const defaultPC = "/assets/images/pc2.jpeg";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch(`/talent/edit-profil`, { method: "GET" });
        if (res?.statut === 200) {
          const u = res.data.user;
          const ds = res.data.domaines_secondaires || [];

          setUserData({
            id: u.id,
            telephone: u.telephone || "",
            bio: u.bio || "",
            pp: u.pp ? `${apifile}/${u.pp}` : defaultPP,
            pc: u.pc ? `${apifile}/${u.pc}` : defaultPC,
          });

          setTalentData({
            nom: u.talent?.nom || "",
            prenom: u.talent?.prenom || "",
            profession: u.talent?.profession || "",
            domaine_id: u.domaine_id || "",
            competence: u.talent?.competence
              ? u.talent.competence.replace(/[\[\]\\"]/g, "")
              : "",
            region: u.talent?.region || "",
            ville: u.talent?.ville || "",
            localisation: u.talent?.localisation || "",
          });

          setDomainesSecondaires(ds.map((d: any) => d.id));
        }
      } catch (err) {
        toast.error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pp" | "pc",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "pp") setPpFile(file);
      else setPcFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const villesDisponibles = useMemo(() => {
    return talentData?.region
      ? (CAMEROON_GEO as any)[talentData.region] || []
      : [];
  }, [talentData?.region]);

  const toggleSecondary = (id: number) => {
    if (domainesSecondaires.includes(id)) {
      setDomainesSecondaires(domainesSecondaires.filter((item) => item !== id));
    } else if (domainesSecondaires.length < 3) {
      setDomainesSecondaires([...domainesSecondaires, id]);
    }
  };

  // Assurez-vous d'avoir ceci au début de votre composant :
  const { setAuth, token, user, talent } = useAuth();

  const handleSubmit = async () => {
    setSaving(true);
    const formData = new FormData();

    // Champs obligatoires selon ton backend
    formData.append("id", userId);
    formData.append("nom", talentData.nom);
    formData.append("prenom", talentData.prenom || "");
    formData.append("profession", talentData.profession || "");
    formData.append("domaine_id", talentData.domaine_id);
    formData.append("region", talentData.region || "");
    formData.append("ville", talentData.ville || "");
    formData.append("localisation", talentData.localisation || "");
    formData.append("telephone", userData.telephone || "");
    formData.append("bio", userData.bio || "");
    formData.append("competence", talentData.competence || "");

    // Domaines secondaires
    domainesSecondaires.forEach((id, index) => {
      formData.append(`domaines_secondaires[${index}]`, id.toString());
    });

    // Fichiers
    if (ppFile) formData.append("pp", ppFile);
    if (pcFile) formData.append("pc", pcFile);

    try {
      const res = await apiFetch(`/talent/update-profil`, {
        method: "POST",
        body: formData,
      });
      if (res.statut === 200) {
        // On récupère le nom de fichier pur venant du serveur (ex: "images/pp/abc.jpg")
        const newPP = res.user?.pp || (ppFile ? user.pp : user.pp);

        const updatedTalent = {
          ...talent,
          ...talentData,
          updated_at: new Date().toISOString(),
        };

        const updatedUser = {
          ...user,
          telephone: userData.telephone,
          bio: userData.bio,
          // IMPORTANT : On enregistre le chemin RELATIF, pas l'URL complète
          pp: res.user?.pp || user.pp,
          talent: updatedTalent,
        };

        setAuth({
          token: token,
          user: updatedUser,
          talent: updatedTalent,
        });

        // Déclenche la mise à jour immédiate de la Navbar
        window.dispatchEvent(new Event("local-storage-update"));

        toast.success("Profil mis à jour !", { duration: 6000 });
        router.push(`/profil-talent/${userId}`);
      } else {
        toast.error(res.message || "Erreur lors de la sauvegarde");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-orange-700" size={40} />
      </div>
    );

  return (
    <div className="w-full pb-20 bg-white">
      <Toaster />
      <BackButton m={16} />

      {/* COVER */}
      <div className="w-full h-56 md:h-72 relative bg-gray-200">
        <Image
          src={previews.pc || userData.pc}
          alt="cover"
          fill
          className="object-cover"
          priority
        />
        <label className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full cursor-pointer hover:bg-black/70 transition">
          <Camera size={18} />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "pc")}
          />
        </label>
      </div>

      <div className="px-2 -mt-20 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* PHOTO DE PROFIL */}
          <div className="relative -right-6">
            <img
              src={previews.pp || userData.pp}
              className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              alt="Profil"
            />
            <label className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full cursor-pointer hover:bg-black/80 transition">
              <Camera size={16} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "pp")}
              />
            </label>
          </div>

          <div className="flex-1 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 md:mt-24 w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Modifier mon profil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Nom
                </label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  value={talentData.nom}
                  onChange={(e) =>
                    setTalentData({ ...talentData, nom: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Prénom
                </label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  value={talentData.prenom}
                  onChange={(e) =>
                    setTalentData({ ...talentData, prenom: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-600">
                  Profession (ex: Développeur Fullstack)
                </label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  value={talentData.profession}
                  onChange={(e) =>
                    setTalentData({ ...talentData, profession: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Région
                </label>
                <select
                  className="mt-1 w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 outline-none"
                  value={talentData.region}
                  onChange={(e) =>
                    setTalentData({ ...talentData, region: e.target.value })
                  }
                >
                  <option value="">Sélectionner...</option>
                  {Object.keys(CAMEROON_GEO).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Ville
                </label>
                <select
                  className="mt-1 w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 outline-none disabled:bg-gray-50"
                  value={talentData.ville}
                  disabled={!talentData.region}
                  onChange={(e) =>
                    setTalentData({ ...talentData, ville: e.target.value })
                  }
                >
                  <option value="">Sélectionner...</option>
                  {villesDisponibles.map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Téléphone
                </label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none"
                  value={userData.telephone}
                  onChange={(e) =>
                    setUserData({ ...userData, telephone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Quartier / Rue
                </label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none"
                  placeholder="ex: Pitoare, Petit Marché"
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

            <div className="mt-5">
              <label className="text-sm font-semibold text-gray-600">
                Ma Bio
              </label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                value={userData.bio}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-gray-600">
                Mes Compétences (Séparées par des virgules)
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none"
                placeholder="React, Laravel, Design"
                value={talentData.competence}
                onChange={(e) =>
                  setTalentData({ ...talentData, competence: e.target.value })
                }
              />
            </div>

            {/* DOMAINES EN DERNIER */}
            <div className="mt-8 space-y-6 border-t pt-6">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Domaine d'expertise principal
                </label>
                <select
                  className="mt-1 w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  value={talentData.domaine_id}
                  onChange={(e) =>
                    setTalentData({ ...talentData, domaine_id: e.target.value })
                  }
                >
                  <option value="">Choisir un domaine</option>
                  {domaines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Domaines secondaires (max 3)
                </label>
                <div className="mt-2 p-1 max-h-40 overflow-y-auto custom-scrollbar border border-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {domaines
                      .filter(
                        (d) =>
                          d.id.toString() !== talentData.domaine_id.toString(),
                      )
                      .map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleSecondary(d.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            domainesSecondaires.includes(d.id)
                              ? "bg-orange-700 text-white shadow-md scale-95"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {d.nom}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-10 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />{" "}
                    Enregistrement...
                  </>
                ) : (
                  "Sauvegarder les modifications"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
