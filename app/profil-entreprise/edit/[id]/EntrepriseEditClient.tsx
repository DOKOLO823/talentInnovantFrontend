"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import domaines from "@/domaines.json";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function EntrepriseEditClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { setAuth, token, user, talent } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    nom: "",
    service: "",
    description: "",
    horaire: "",
    siteweb: "",
    telephone: "",
    bio: "",
    domaine_id: "",
  });

  // Images states
  const [previews, setPreviews] = useState({
    pp: "",
    pc: "",
  });
  const [files, setFiles] = useState<{ pp: File | null; pc: File | null }>({
    pp: null,
    pc: null,
  });

  useEffect(() => {
    const fetchInfos = async () => {
      try {
        const res = await apiFetch(`/entreprise/edit-profil`, {
          method: "GET",
        });
        if (res.statut === 200) {
          const u = res.data.user;
          const e = res.data.entreprise;

          setFormData({
            nom: e.nom || "",
            service: e.service || "",
            description: e.description || "",
            horaire: e.horaire || "",
            siteweb: e.siteweb || "",
            telephone: u.telephone || "",
            bio: u.bio || "",
            domaine_id: u.domaine_id?.toString() || "",
          });

          setPreviews({
            pp: u.pp ? `${apifile}/${u.pp}` : "/assets/images/pp2.png",
            pc: u.pc ? `${apifile}/${u.pc}` : "/assets/images/pc2.jpeg",
          });
        }
      } catch (err) {
        toast.error("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchInfos();
  }, [id]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "pp" | "pc",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (files.pp) data.append("pp", files.pp);
    if (files.pc) data.append("pc", files.pc);

    try {
      const res = await apiFetch("/entreprise/update-profil", {
        method: "POST",
        body: data,
      });

      if (res.statut == 200) {
        // 1. Préparation du profil entreprise
        const updatedProfile = {
          ...talent,
          nom: formData.nom,
          service: formData.service,
          description: formData.description,
          horaire: formData.horaire,
          siteweb: formData.siteweb,
          updated_at: new Date().toISOString(),
        };

        // 2. Mise à jour de l'objet User avec les NOUVELLES IMAGES
        // res.data.user contient normalement les nouveaux chemins 'images/pp/...'
        const updatedUser = {
          ...user,
          telephone: formData.telephone,
          bio: formData.bio,
          domaine_id: parseInt(formData.domaine_id),
          // ON UTILISE ICI LE CHEMIN RENVOYÉ PAR LE BACKEND (res.data.user)
          pp: res.data?.user?.pp || user.pp,
          pc: res.data?.user?.pc || user.pc,
          entreprise: updatedProfile,
        };

        // 3. Mise à jour du Store Global
        setAuth({
          token: token,
          user: updatedUser,
          talent: updatedProfile,
        });

        toast.success("Profil mis à jour avec succès !", { duration: 6000 });
        router.push(`/profil-entreprise/${user.id}`);
      } else if (res.statut === 422) {
        setErrors(res.erreurs || {});
        toast.error(res?.message || "Erreur de validation");
      }
    } catch (err) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
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
      <BackButton m={20} />

      {/* COVER (PC) */}
      <div className="w-full h-56 md:h-72 relative bg-gray-100">
        <Image
          src={previews.pc}
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
            onChange={(e) => handleFileChange(e, "pc")}
            accept="image/*"
          />
        </label>
      </div>

      <div className="px-6 -mt-20 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* AVATAR (PP) */}
          <div className="relative">
            <img
              src={previews.pp}
              className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />
            <label className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-full cursor-pointer hover:bg-black/80 transition">
              <Camera size={16} />
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, "pp")}
                accept="image/*"
              />
            </label>
          </div>

          {/* FORMULAIRE */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow md:mt-24 w-full border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Modifier l'entreprise</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input
                  className={`mt-1 w-full border rounded px-3 py-2 outline-none focus:border-orange-700 ${errors.nom ? "border-red-500" : "border-gray-300"}`}
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
                {errors.nom && (
                  <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>
                )}
              </div>

              {/* Domaine */}
              <div>
                <label className="text-sm font-medium">Domaine</label>
                <select
                  className={`mt-1 w-full border rounded px-3 py-2 outline-none focus:border-orange-700 ${errors.domaine_id ? "border-red-500" : "border-gray-300"}`}
                  value={formData.domaine_id}
                  onChange={(e) =>
                    setFormData({ ...formData, domaine_id: e.target.value })
                  }
                >
                  <option value="">Sélectionnez...</option>
                  {domaines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  ))}
                </select>
                {errors.domaine_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.domaine_id[0]}
                  </p>
                )}
              </div>

              {/* Service */}
              <div>
                <label className="text-sm font-medium">Service</label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                />
              </div>

              {/* Horaire */}
              <div>
                <label className="text-sm font-medium">Horaire</label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  value={formData.horaire}
                  onChange={(e) =>
                    setFormData({ ...formData, horaire: e.target.value })
                  }
                />
              </div>

              {/* Site Web */}
              <div>
                <label className="text-sm font-medium">Site Web</label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  value={formData.siteweb}
                  onChange={(e) =>
                    setFormData({ ...formData, siteweb: e.target.value })
                  }
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                />
              </div>

              {/* Bio */}
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Bio (Entreprise)</label>
                <textarea
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium">
                  Description (Entreprise)
                </label>
                <textarea
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-orange-700"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-700 text-white px-8 py-2 rounded-lg hover:bg-orange-800 disabled:bg-gray-400 transition flex items-center gap-2"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
