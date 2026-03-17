"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

import TabAbout from "./TabAbout";
import TabChallenges from "./TabChallenges";
import TabOpportunites from "./TabOpportunites";
import apifile from "@/app/lib/apifile";
import { CheckCircle2 } from "lucide-react";
import LoginRequiredCard from "@/app/components/cards/LoginRequiredCard";
import path from "path/win32";
import TabAnnonces from "./TabAnnonces";

export default function EntrepriseProfileClient({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("about");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    // 1. On récupère l'utilisateur
    const storedAuth = localStorage.getItem("auth");
    const user = storedAuth ? JSON.parse(storedAuth).user : null;
    setCurrentUser(user);

    // 2. On lance l'API systématiquement
    // On passe l'id pour récupérer les infos publiques de l'entreprise
    apiFetch(`/entreprise/profil/${id}`, { method: "GET" })
      .then((res) => {
        if (res.statut === 200) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        // QUOI QU'IL ARRIVE, on arrête le spinner
        setLoading(false);
      });
  }, [id]);

  // --- LOGIQUE D'AFFICHAGE ---

  // 1. Pendant le chargement
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700 mr-3"></div>
        <div className="animate-pulse text-orange-700 font-bold">
          Chargement...
        </div>
      </div>
    );
  }

  // 2. Si non connecté : On affiche la Card au lieu du profil
  if (!currentUser) {
    return (
      <div className="w-full">
        <LoginRequiredCard />
      </div>
    );
  }

  // 3. Si connecté mais erreur data
  if (!data) {
    return (
      <div className="p-10 text-center mt-24 flex flex-col items-center justify-center gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">
            Entreprise introuvable
          </h3>
          <p className="text-slate-500">
            Nous n'avons pas pu charger les informations de cette entreprise.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Actualiser la page
        </button>
      </div>
    );
  }

  // Vérification de propriété (user_id du profil vs id du user connecté)
  const isOwner = currentUser?.id == data?.entreprise?.user_id;

  const handleToggleAbonnement = async () => {
    if (isToggling || !currentUser) return;

    try {
      setIsToggling(true);
      const res = await apiFetch("/entreprise/abonnement/toggle", {
        method: "POST",
        body: JSON.stringify({ entreprise_id: data.entreprise.id }),
      });

      if (res.statut === 200) {
        if (res?.message === "Abonnement réussi.") {
          toast.success(
            "Vous serez informé des opportunités proposées par cette entreprise",
            { duration: 5000 },
          );
        } else {
          toast.success(res?.message || "Désabonnement réussi.");
        }

        // Mise à jour locale de l'état is_abonne
        setData((prev: any) => ({
          ...prev,
          entreprise: { ...prev.entreprise, is_abonne: res.abonne },
        }));
      }
    } catch (err) {
      console.error("Erreur toggle:", err);
    } finally {
      setIsToggling(false);
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex justify-center p-5">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
        </div>
        <div className="animate-pulse text-orange-700 font-bold md:text-xl">
          Chargement du profil...
        </div>
      </div>
    );

  if (!data)
    return <div className="p-10 text-center mt-24">Entreprise introuvable</div>;

  const { entreprise, total } = data;

  return (
    <div className="w-full">
      <Toaster />
      <BackButton m={16} />

      <div className="w-full h-56 md:h-72 relative mt-2">
        <Image
          src={
            entreprise?.user?.pc
              ? apifile + "/" + entreprise?.user?.pc
              : "/assets/images/pc2.jpeg"
          }
          fill
          className="object-cover"
          alt="cover"
        />
      </div>

      <div className="px-4 md:px-8 -mt-20 relative">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
            <img
              src={
                entreprise?.user?.pp
                  ? apifile + "/" + entreprise?.user?.pp
                  : "/assets/images/ppe.png"
              }
              className="object-cover w-full h-full"
              alt="logo"
            />
          </div>

          <div className="text-center md:text-left">
            <div className="flex justify-center items-center md:justify-start flex-wrap gap-1.5 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {entreprise?.nom}
              </h1>

              {/* Badge de certification Orange-700 : Affiché de manière proche et directe */}
              {(entreprise?.user?.certifie === 1 ||
                entreprise?.user?.certifie === true) && (
                <CheckCircle2
                  className="w-6 h-6 text-orange-700 fill-orange-700/10 flex-shrink-0"
                  strokeWidth={2.5}
                />
              )}
            </div>

            <p className="text-gray-900 text-lg">{entreprise?.service}</p>
            <p className="text-gray-600 my-4 text-start">
              {entreprise?.user?.bio}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Bouton Modifier : Uniquement pour le propriétaire */}
            {isOwner ? (
              <Link
                href={`/profil-entreprise/edit/${id}`}
                className="bg-orange-700 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-800 transition-all font-medium"
              >
                Modifier le profil de l'entreprise
              </Link>
            ) : (
              /* Bouton S'abonner : Uniquement pour les visiteurs */
              currentUser &&
              !isOwner && (
                <button
                  onClick={handleToggleAbonnement}
                  disabled={isToggling}
                  className={`px-6 py-2 rounded-lg shadow font-medium transition-all ${
                    entreprise.is_abonne
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-orange-700 text-white hover:bg-orange-800"
                  }`}
                >
                  {isToggling
                    ? "En cours..."
                    : entreprise.is_abonne
                      ? "Se désabonner"
                      : "S'abonner"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 mt-6 border-b flex gap-6 bg-white sticky top-0 z-30 pt-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {["about", "challenges", "annonces"].map(
          (
            t, // Ajout de "annonces"
          ) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 border-b-2 shrink-0 capitalize ${
                activeTab === t
                  ? "border-orange-700 text-orange-700 font-semibold"
                  : "border-transparent text-gray-600"
              }`}
            >
              {t === "about"
                ? "À propos"
                : t === "challenges"
                  ? "Challenges"
                  : "Annonces"}
            </button>
          ),
        )}
      </div>

      <div className="px-4 md:px-8 mt-6 pb-14">
        {activeTab === "about" && (
          <TabAbout entreprise={entreprise} total={total} />
        )}
        {activeTab === "challenges" && (
          <TabChallenges id={id} isOwner={isOwner} />
        )}
        {/* Nouveau Tab Annonces */}
        {activeTab === "annonces" && (
          <TabAnnonces userId={data.entreprise.user_id} />
        )}
      </div>
    </div>
  );
}
