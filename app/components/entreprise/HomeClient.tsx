"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "./StatCard";
import ChallengeCard from "../ChallengeCard";
import { Plus, Loader2, ShieldCheck, PlusCircle } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import CreateOpportunityModal from "./CreateOpportunityModal";
import domainesJSON from "@/domaines.json";
import CertificationModal from "../modals/CertificationModal";
import ChallengeTypeModal from "./modals/ChallengeTypeModal";

export default function HomeClient() {
  // Chargements séparés
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [challengesEnCours, setChallengesEnCours] = useState([]);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenChallenge, setIsModalOpenChallenge] = useState(false);
  const [opportunites, setOpportunites] = useState<any[]>([]);
  const [certifie, setCertifie] = useState(1);
  const [openCertifModal, setOpenCertifModal] = useState(false);
  const [soldeEntreprise, setSoldeEntreprise] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("auth");
      if (!userStr) {
        setLoadingStats(false);
        setLoadingChallenges(false);
        return;
      }

      const authData = JSON.parse(userStr);
      const userId = authData?.user?.id || authData?.id;

      if (!userId) {
        router.push("/auth/login");
        return;
      }

      // 1. Charger les stats
      apiFetch(`/entreprise/stats-globales`, { method: "GET" })
        .then((res) => {
          if (res?.statut === 200) setStats(res.data);
          setCertifie(res?.data?.entreprise?.user?.certifie);
          setSoldeEntreprise(res.data?.entreprise?.solde);
        })
        .finally(() => setLoadingStats(false));

      // 2. Charger les challenges
      apiFetch("/entreprise/meschallenges/en-cours", { method: "GET" })
        .then((res) => {
          if (res?.statut === 200) {
            const cleanedChallenges = res?.challenges_en_cours?.map(
              (c: any) => {
                let rewardsArray = ["Prix non défini"];
                try {
                  if (typeof c.recompense === "string" && c.recompense) {
                    const parsed = JSON.parse(c.recompense);
                    rewardsArray = parsed ? Object?.values(parsed) : [];
                  }
                } catch (e) {
                  console.error(e);
                }

                return {
                  ...c,
                  title: c.titre,
                  image:
                    (c.photo && apifile + "/" + c.photo) ||
                    "../assets/images/innov.jpg",
                  locationType: c.lieu || "En ligne",
                  startDate: c.datelancement,
                  endDate: c.datefin,
                  endInscription: c.datefininscription,
                  participants: c.nombrecompetiteur || 0,
                  rewards: rewardsArray,
                  categories:
                    c?.domaines?.length > 0
                      ? c.domaines?.map((d: any) => d.nom)
                      : ["Général"],
                  entrepriseNom: "Votre Entreprise",
                  entrepriseLogo: apifile + "/" + authData?.user?.pp || null,
                  entrepriseId: userId,
                };
              },
            );
            setChallengesEnCours(cleanedChallenges);
          }
        })
        .finally(() => setLoadingChallenges(false));
    };

    fetchData();
  }, []);

  const displayStats = {
    challenges: stats?.challenges_total || "-",
    enCours: stats?.challenges_en_cours || "-",
    avenir: stats?.challenges_avenir || "-",
    termines: stats?.challenges_termines || "-",
    abonnes: stats?.entreprise?.abonnees_count || "-",
    points: stats?.entreprise?.point || "-",
    rang: stats?.entreprise?.rang || "-",
    solde: stats?.entreprise?.solde || "-",
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden mt-12 ">
      <Toaster />

      {/* Bannière de Certification */}
      {!certifie && (
        <div className="mb-8 p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black uppercase text-sm tracking-tight">
                Certification Entreprise
              </h3>
              <p className="text-slate-600 text-[15px] font-medium">
                Votre profil n'est pas encore certifié. La certification
                renforce votre crédibilité auprès des talents <br /> et vous
                permet de publier des challenges et des opportunités.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenCertifModal(true)}
            className="px-6 py-3 bg-orange-700 hover:bg-orange-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-orange-700/20 whitespace-nowrap"
          >
            Demander la certification
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold">Tableau de bord</h2>

      {/* SECTION STATS AVEC SKELETON */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          Array(8)
            .fill(0)
            .map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Challenges totaux"
              value={displayStats.challenges}
            />
            <StatCard label="En cours" value={displayStats.enCours} />
            <StatCard label="À venir" value={displayStats.avenir} />
            <StatCard label="Terminés" value={displayStats.termines} />
            <StatCard label="Abonnés" value={displayStats.abonnes} />
            <StatCard label="Points" value={displayStats.points} />
            <StatCard label="Rang" value={displayStats.rang} />
            <StatCard
              label="Solde en FCFA"
              value={displayStats?.solde?.toLocaleString()}
            />
          </>
        )}
      </div>

      {/* SECTION CHALLENGES AVEC SKELETON */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Vos challenges en cours{" "}
            {challengesEnCours.length > 0 && `(${challengesEnCours.length})`}
          </h3>
          <Link
            href="/home-entreprise/Challenges"
            className="text-orange-700 hover:underline"
          >
            Voir plus
          </Link>
        </div>

        {loadingChallenges ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <ChallengeSkeleton key={i} />
              ))}
          </div>
        ) : challengesEnCours.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {challengesEnCours.map((c: any) => (
              <div key={c.id} className="flex-shrink-0 w-80">
                <ChallengeCard challenge={c} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed rounded-2xl p-10 text-center">
            <p className="text-gray-500">
              Aucun challenge actif pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* LE RESTE RESTE INCHANGÉ ET S'AFFICHE DIRECTEMENT */}
      <div className="text-start space-y-4">
        <p className="text-xl font-semibold mt-4">
          Comment organiser un challenge ?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Step
            index={1}
            title="Cliquer sur Organiser"
            desc="Démarrez le processus en cliquant sur le bouton."
          />
          <Step
            index={2}
            title="Remplir & soumettre"
            desc="Renseignez toutes les informations du challenge."
          />
          <Step index={3} title="Évaluer" desc="Évaluez les projets reçus." />
          <Step
            index={4}
            title="Publier les résultats"
            desc="Annoncez les gagnants et félicitez les participants."
          />
        </div>

        {!loadingStats && (
          <>
            {/* Bouton d'action principal déporté à droite pour l'équilibre visuel */}
            <button
              onClick={() => setIsModalOpenChallenge(true)}
              className="bg-orange-700 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-orange-800 transition-all shadow-lg shadow-orange-100 active:scale-95 font-bold text-lg"
            >
              <PlusCircle size={22} /> Organiser ou publier un challenge
            </button>
          </>
        )}

        {/* <p className="text-xl font-semibold mt-4">
          Comment publier une opportunité ?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Step
            index={1}
            title="Cliquer sur Publier"
            desc="Commencez la création de l'offre."
          />
          <Step
            index={2}
            title="Remplir & soumettre"
            desc="Ajoutez titre, description, type."
          />
          <Step
            index={3}
            title="Évaluer les candidatures"
            desc="Sélectionnez les bons profils."
          />
          <Step
            index={4}
            title="Contacter les retenus"
            desc="Entrez en contact et embauchez."
          />
        </div> */}

        {/* <div
          onClick={() => setIsModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 border border-orange-700 text-orange-700 px-5 py-3 mt-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Plus /> Publier une opportunité
        </div> */}
      </div>

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

      <CertificationModal
        isOpen={openCertifModal}
        onClose={() => setOpenCertifModal(false)}
      />

      {/* Modal réutilisable appelé ici */}
      <ChallengeTypeModal
        isOpen={isModalOpenChallenge}
        onClose={() => setIsModalOpenChallenge(false)}
        solde={soldeEntreprise}
      />
    </div>
  );
}

// --- COMPOSANTS DE CHARGEMENT (SKELETONS) ---

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-gray-200 animate-pulse relative h-24">
      <div className="h-8 w-12 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-24 bg-gray-100 rounded"></div>
      <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full"></div>
    </div>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-4"></div>
      </div>
    </div>
  );
}

function Step({ index, title, desc }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
      <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 mx-auto flex items-center justify-center font-bold">
        {index}
      </div>
      <h5 className="font-semibold mt-3">{title}</h5>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}
