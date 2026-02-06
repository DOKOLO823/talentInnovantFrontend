"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "./StatCard";
import ChallengeCard from "../ChallengeCard";
import { Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import CreateOpportunityModal from "./CreateOpportunityModal";
import domainesJSON from "@/domaines.json";;

export default function HomeClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [challengesEnCours, setChallengesEnCours] = useState([]);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opportunites, setOpportunites] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("auth");
      if (!userStr) {
        setLoading(false);
        return;
      }

      const authData = JSON.parse(userStr);
      const userId = authData?.user?.id || authData?.id;

      try {
        if(!userId){
          router.push("/auth/login");
          return;
        }
        const resProfil = await apiFetch(`/entreprise/stats-globales`, { method: "GET" });
        const resChallenges = await apiFetch("/entreprise/meschallenges/en-cours", { method: "GET" });

        if (resProfil?.statut === 200) {
          setStats(resProfil.data);
        }

        if (resChallenges?.statut === 200) {
          const cleanedChallenges = resChallenges?.challenges_en_cours?.map((c: any) => {
            let rewardsArray = ["Prix non défini"];
            try {
              if (typeof c.recompense === 'string' && c.recompense) {
                const parsed = JSON.parse(c.recompense);
                rewardsArray = parsed ? Object?.values(parsed) : [];
              }
            } catch (e) { console.error("Erreur parse récompenses", e); }

            return {
              ...c,
              title: c.titre,
              image: c.photo && apifile + '/' + c.photo || "../assets/images/innov.jpg",
              locationType: c.lieu || "En ligne",
              startDate: c.datelancement,
              endDate: c.datefin,
              inscriptionEnd: c.datefininscription,
              participants: c.nombrecompetiteur || 0,
              rewards: rewardsArray,
              categories: c?.domaines && c.domaines?.length > 0 ? c.domaines?.map((d: any) => d.nom) : ["Général"],
              entrepriseNom: resProfil.data?.entreprise?.nom || "Votre Entreprise",
              entrepriseLogo: apifile + '/' + resProfil.data?.entreprise?.user?.pp || null,
              entrepriseId: resProfil.data?.entreprise?.user_id
            };
          });
          setChallengesEnCours(cleanedChallenges);
        }
      } catch (err) {
        console.error("Erreur globale:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-orange-700" size={48} />
      </div>
    );
  }

  const displayStats = {
    challenges: stats?.challenges_total || 0,
    enCours: stats?.challenges_en_cours || 0,
    avenir: stats?.challenges_avenir || 0,
    termines: stats?.challenges_termines || 0,
    abonnes: stats?.entreprise?.abonnees_count || 0,
    points: stats?.entreprise?.point || 0,
    rang: stats?.entreprise?.rang || "-"
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden mt-12 ">
      <Toaster/>
      <h2 className="text-2xl font-bold">Tableau de bord</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Challenges totaux" value={displayStats.challenges} />
        <StatCard label="En cours" value={displayStats.enCours} />
        <StatCard label="À venir" value={displayStats.avenir} />
        <StatCard label="Terminés" value={displayStats.termines} />
        <StatCard label="Abonnés" value={displayStats.abonnes} />
        <StatCard label="Points" value={displayStats.points} />
        <StatCard label="Rang" value={displayStats.rang==1 ? displayStats.rang+'er' : displayStats.rang+'e'} />
      </div>

    {challengesEnCours.length > 0 && <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Vos challenges en cours {challengesEnCours?.length>0 && '('+challengesEnCours?.length+')'}</h3>
        <Link href="/home-entreprise/Challenges" className="text-orange-700 hover:underline">Voir plus</Link>
      </div>

      {challengesEnCours?.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {challengesEnCours?.map((c: any) => (
            <div key={c.id} className="flex-shrink-0 w-80">
              <ChallengeCard challenge={c} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed rounded-2xl p-10 text-center">
          <p className="text-gray-500">Aucun challenge actif pour le moment.</p>
        </div>
      )}
      </>}

      <div className="text-start space-y-4">
        
        <p className="text-xl font-semibold mt-4">Comment organiser un challenge ?</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
           <Step index={1} title="Cliquer sur Organiser" desc="Démarrez le processus en cliquant sur le bouton." />
           <Step index={2} title="Remplir & soumettre" desc="Renseignez toutes les informations du challenge." />
           <Step index={3} title="Évaluer" desc="Évaluez les projets reçus." />
           <Step index={4} title="Publier les résultats" desc="Annoncez les gagnants et félicitez les participants." />
        </div>

         {/* SECTION CHALLENGE */}
        <Link href="/challenge/create" className="inline-flex items-center gap-2 bg-orange-700 text-white px-5 py-3 rounded-lg hover:bg-orange-800 transition-colors">
          <Plus /> Organiser un challenge
        </Link>

        <p className="text-xl font-semibold mt-4">Comment publier une opportunité ?</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Step index={1} title="Cliquer sur Publier" desc="Commencez la création de l'offre." />
          <Step index={2} title="Remplir & soumettre" desc="Ajoutez titre, description, type." />
          <Step index={3} title="Évaluer les candidatures" desc="Sélectionnez les bons profils." />
          <Step index={4} title="Contacter les retenus" desc="Entrez en contact et embauchez." />
        </div>

          {/* SECTION OPPORTUNITÉ RÉINTÉGRÉE */}
        <div onClick={() => setIsModalOpen(true)} className="inline-flex cursor-pointer items-center gap-2 border border-orange-700 text-orange-700 px-5 py-3 mt-2 rounded-lg hover:bg-orange-50 transition-colors">
          <Plus /> Publier une opportunité
        </div>

      </div>

       {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateOpportunityModal 
            onClose={() => setIsModalOpen(false)}
            domaines={domainesJSON}
            onSuccess={(newOpp: any) => {
              setOpportunites((prev) => [newOpp, ...prev]);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ index, title, desc }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
      <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 mx-auto flex items-center justify-center font-bold">{index}</div>
      <h5 className="font-semibold mt-3">{title}</h5>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}