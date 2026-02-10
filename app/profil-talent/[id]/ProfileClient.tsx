"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, X, MessageSquare } from "lucide-react";
import FullImageModal from "./FullImageModal";
import TabsAbout from "./TabsAbout";
import TabsProjects from "./TabsProjects";
import TabsPortfolio from "./TabsPortfolio";
import TabsCV from "./TabsCV";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileClient() {
  const params = useParams();
  const userId = params.id as string;

  const [showPP, setShowPP] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>();
  const [showContactModal, setShowContactModal] = useState(false);

  // fonction pour informer le user de la visite d'une ets
  useEffect(() => {
    if (userId) fetchUserProfile();
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) setCurrentUser(JSON.parse(storedAuth).user);
  }, [userId]);

  const isOwner = currentUser?.id == userId;
  const isEntreprise = currentUser?.statut === "entreprise";

  // Dans ta page Profil Talent (Client Component)
  useEffect(() => {
    const recordVisit = async () => {
      // 1. On vérifie si l'utilisateur connecté est une entreprise
      // userConnecte provient de ton context d'auth ou de ta session
      if (
        currentUser?.statut == "entreprise" &&
        userId &&
        currentUser?.id != userId
      ) {
        try {
          const res = await apiFetch("/notifications/record-visit", {
            method: "POST",
            body: JSON.stringify({
              talent_id: userId, // l'ID du talent visité
              entreprise_id: currentUser?.id, // l'ID de l'entreprise qui visite
            }),
          });
          console.log(res);
        } catch (error) {
          console.error("Erreur enregistrement visite:", error);
        }
      }
    };

    recordVisit();
  }, [userId, currentUser?.id]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch(`/talent/profil/${userId}`, { method: "GET" });

      if (res?.statut === 200) {
        const transformedUser = {
          id: res.user.id,
          email: res.user.email,
          telephone: res.user.telephone,
          name: res.talent?.nom || "Talent",
          profession: res.talent?.profession || "Innovateur",
          bio: res.user.bio || "",
          avatar: res.user.pp
            ? `${apifile}/${res.user.pp}`
            : "../assets/images/pp2.png",
          cover: res.user.pc
            ? `${apifile}/${res.user.pc}`
            : "../assets/images/pc2.jpeg",
          skills: res.talent?.competence
            ? Array.isArray(res.talent.competence)
              ? res.talent.competence
              : res.talent.competence.split(",").map((s: string) => s.trim())
            : [],
          rang_general: res.rang_general,
          total_talent: res.total_talent,
          points: res.talent?.point || 0,
          trophies: res.talent?.trophee || 0,
          region: res.talent?.region || "-",
          city: res.talent?.ville || "-",
          location: res.talent?.localisation || "-",
          created_at: res.user.created_at || "-",
          domaine: res.domaine_principal,
          domaines_secondaires: res.domaines_secondaires,
        };

        const transformedProjects =
          res.posts_par_challenge?.flatMap((challengeGroup: any[]) =>
            challengeGroup.map((post: any) => ({
              id: post.id,
              rank: post.rang,
              author: {
                id: res.user.id,
                name: res.talent?.nom || res.user?.name || "Talent",
                role: res.talent?.profession || "Innovateur",
                avatar: transformedUser.avatar,
              },
              challenge: {
                id: post.challenge_id,
                name: post.challenge?.titre || "Challenge",
                image: post.challenge?.photo
                  ? `${apifile}/${post.challenge.photo}`
                  : "/default-challenge.jpg",
                typeevaluation: post.typeevaluation?.type,
                resultatdisponible:
                  post.challenge?.resultatdisponible == 1 ? 1 : 0,
                datefin: post?.challenge?.datefin,
                portee: post?.challenge?.portee?.portee,
              },
              responses:
                post.responses?.map((response: any) => ({
                  id: response.id,
                  field: response.field,
                  value: response.value,
                })) || [],
              notefinale: post.notefinale,
              score: post.score,
              vote: post.like,
              idlikeurs: post?.likeurs_ids,
            })),
          ) || [];

        setUserData(transformedUser);
        setProjectsData(transformedProjects);
      } else {
        setError("Profil non trouvé");
      }
    } catch (error) {
      setError("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <BackButton m={16} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="w-full text-center py-20">
        <BackButton m={16} />
        <h1 className="text-2xl font-bold">Profil non trouvé</h1>
        <button
          onClick={fetchUserProfile}
          className="mt-4 bg-orange-700 text-white px-5 py-2 rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toaster />
      <BackButton m={16} />

      {/* COVER */}
      <div className="w-full h-56 md:h-100 relative">
        <Image
          src={userData.cover}
          fill
          className="object-cover"
          alt="cover"
          priority
        />
      </div>

      {/* PHOTO + INFOS */}
      <div className="px-4 md:px-8 -mt-20 relative">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div
            className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl cursor-pointer"
            onClick={() => setShowPP(true)}
          >
            <img
              src={userData?.avatar}
              className="object-cover w-full h-full"
              alt="avatar"
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{userData?.name}</h1>
            <p className="text-gray-600">{userData?.profession}</p>
            <p className="text-gray-500 mt-1 max-w-xl">{userData?.bio}</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {isOwner && (
              <Link
                href={`/profil-talent/edit/${userId}`}
                className="bg-orange-700 text-white px-5 py-2 rounded-lg shadow hover:bg-orange-800 transition"
              >
                Modifier mon profil
              </Link>
            )}

            {isEntreprise && !isOwner && (
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-orange-700 text-white px-5 py-2 rounded-lg shadow hover:bg-black flex items-center gap-2 transition"
              >
                <MessageSquare size={18} /> Contacter ce talent
              </button>
            )}
          </div>
        </div>
      </div>

      {showPP && (
        <FullImageModal
          src={userData.avatar}
          onClose={() => setShowPP(false)}
        />
      )}

      {/* TABS (STICKY) */}
      <div className="px-4 md:px-8 mt-6 border-b flex gap-6 bg-white sticky top-0 z-40 pt-4 overflow-x-auto no-scrollbar">
        {["about", "projets", "portfolio", "cv"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-orange-700 text-orange-700 font-semibold"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab === "about"
              ? "À propos"
              : tab === "cv"
                ? "CV"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENT TABS */}
      <div className="px-4 md:px-8 mt-6 pb-14">
        {activeTab === "about" && <TabsAbout user={userData} />}
        {activeTab === "projets" && (
          <TabsProjects
            projects={projectsData}
            userId={userId}
            onRefresh={fetchUserProfile}
            currenUser={currentUser}
          />
        )}
        {activeTab === "portfolio" && (
          <TabsPortfolio
            userId={userId}
            userData={userData}
            currentUser={currentUser}
          />
        )}
        {activeTab === "cv" && (
          <TabsCV userId={userId} currentUser={currentUser} />
        )}
      </div>

      {/* MODAL CONTACT */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <X />
              </button>

              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-orange-100 mb-4">
                  <img
                    src={userData.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold line-clamp-1">
                  Contacter {userData.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-1">
                  {userData.profession}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`mailto:${userData.email}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-orange-50 text-orange-700 rounded-2xl font-bold hover:bg-orange-100 transition-all border border-orange-100"
                >
                  <Mail size={20} /> {userData.email}
                </a>
                <a
                  href={`tel:${userData.telephone}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
                >
                  <Phone size={20} /> {userData.telephone || ""}
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
