"use client";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/app/lib/api";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

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

export default function LocationModal() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ region: "", ville: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authItem = localStorage.getItem("auth");
    if (!authItem) return;

    try {
      const authData = JSON.parse(authItem);
      const user = authData.user;

      // 1. On cherche la région de manière flexible (soit dans user.talent, soit dans authData.talent)
      const region = user?.talent?.region || authData.talent?.region;

      // 2. On vérifie si c'est un talent et si la région est absente (null, undefined ou vide "")
      if (
        user?.statut === "talent" &&
        (!region || region == "" || region == "null")
      ) {
        // 3. Gestion du délai de 24h (lastLocationPrompt)
        const lastPrompt = localStorage.getItem("lastLocationPrompt");
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!lastPrompt || now - parseInt(lastPrompt) > oneDay) {
          setShowModal(true);
        }
      }
    } catch (e) {
      console.error("Erreur lors de la vérification de la localisation :", e);
    }
  }, []);

  const handleUpdate = async () => {
    if (!form.region || !form.ville) return;
    setLoading(true);

    try {
      const res = await apiFetch("/talent/update-location", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (res?.statut === 200) {
        // 1. Récupérer les données actuelles
        const authData = JSON.parse(localStorage.getItem("auth") || "{}");

        // 2. Mettre à jour l'objet en respectant ta structure (user.talent)
        if (authData.user) {
          // On s'assure que talent existe dans l'objet user
          if (!authData.user.talent) authData.user.talent = {};

          authData.user.talent.region = form.region;
          authData.user.talent.ville = form.ville;

          // Si tu as aussi un champ talent à la racine comme dans ton console.log
          if (authData.talent) {
            authData.talent.region = form.region;
            authData.talent.ville = form.ville;
          }

          // 3. Sauvegarder dans le localStorage
          localStorage.setItem("auth", JSON.stringify(authData));

          // 4. ✅ DÉCLENCHER L'ÉVÉNEMENT POUR LA NAVBAR
          // Cela permet à useEffect de ta Navbar de capter le changement immédiatement
          window.dispatchEvent(new Event("local-storage-update"));
        }

        toast.success("Profil mis à jour !");
        setShowModal(false);
      }
    } catch (error) {
      toast.error("Erreur de connexion");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-orange-700 p-6 text-white text-center">
          <MapPin className="mx-auto mb-2 h-8 w-8 text-orange-200" />
          <h3 className="text-xl font-bold">
            Précisez votre localité de résidence
          </h3>
          <p className="text-orange-100 text-[13px] mt-1 leading-tight">
            Pour ne manquer aucun challenge organisé dans votre localité, nous
            avons besoin de connaître votre région de résidence.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <select
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-700 outline-none transition-all"
            value={form.region}
            onChange={(e) => setForm({ region: e.target.value, ville: "" })}
          >
            <option value="">Sélectionnez votre région</option>
            {Object.keys(CAMEROON_GEO).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-700 outline-none transition-all disabled:bg-gray-50"
            value={form.ville}
            disabled={!form.region}
            onChange={(e) => setForm({ ...form, ville: e.target.value })}
          >
            <option value="">Sélectionnez votre ville</option>
            {form.region &&
              CAMEROON_GEO[form.region as keyof typeof CAMEROON_GEO].map(
                (v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ),
              )}
          </select>

          <button
            onClick={handleUpdate}
            disabled={!form.ville || loading}
            className="w-full py-3 bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Valider"}
          </button>

          <button
            onClick={() => {
              localStorage.setItem("lastLocationPrompt", Date.now().toString());
              setShowModal(false);
            }}
            className="w-full text-gray-500 text-sm hover:text-gray-600 transition"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
