"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Pencil,
  Trash,
  Globe,
  ArrowUp,
  Heart,
  X,
  Send,
  LogIn,
  Loader2,
  Facebook,
  MessageSquare,
  Lock,
  ChevronRight,
  Trophy,
  ListOrdered,
  Clock,
  Info,
  Star,
  ShieldCheck,
  UserCheck,
  UserPlus,
  CheckCircle,
  MessageCircle,
  Copy,
  Eye,
  ExternalLink,
  ArrowRight,
  Save,
  AlertCircle,
  Scale,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// Imports locaux
import { API_BASE_URL, apiFetch } from "@/app/lib/api";
import ProjectCard from "@/app/components/cards/ProjectCard";
import ProjectCardResult from "@/app/components/cards/ProjectCardResult";
import ProjectCardToEvaluate from "@/app/components/cards/ProjectCardToEvaluate";
import EvaluateProjectModal from "@/app/components/modals/EvaluateProjectModal";
import BackButton from "@/app/components/BackButton";
import ProjectSubmissionModal from "@/app/components/modals/ProjectSubmissionModal";
import { a, data } from "framer-motion/client";
import apifile from "@/app/lib/apifile";
import BackToTop from "@/app/components/BackToTop";
import ProjectFormPreviewModal from "@/app/components/modals/ProjectFormPreviewModal";
import ChallengeAnalytics from "../tabsChallenge/ChallengeAnalytics";
import ChallengeMoreOptions from "./components/ChallengeMoreOptions";

// --- MODALS DE BASE ---

function ModalBase({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

// modal redirection lien externe
// 1. Modal Interstitielle (Redirection Externe)
const ExternalRedirectModal = ({ isOpen, onClose, onConfirm, url }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-4 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="w-10 h-10 text-orange-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            Challenge Externe
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Ce challenge se déroule en dehors de{" "}
            <strong>TALENT INNOVANT</strong>. Vous allez être redirigé vers la
            plateforme du challenge pour soumettre votre candidature.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 w-full py-4 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200"
            >
              Continuer vers le challenge
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="py-3 text-gray-600 font-bold hover:text-gray-600 transition"
            >
              Rester ici
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT CARD PRIVÉE (POUR RÉSULTATS CACHÉS) ---
function PrivateResultCard({ project, rank, challenge }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Link
      href={"/profil-talent/" + project.user?.id}
      className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-600"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
            <Image
              src={
                project.user?.pp
                  ? `${apifile}/${project.user.pp}`
                  : "/avatar.png"
              }
              alt="User"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-gray-900 uppercase text-xs">
              {project.user?.talent?.nom?.length > 15
                ? project.user?.talent?.nom?.substring(0, 15) + "..."
                : project.user?.talent?.nom || "Talent"}
            </p>
            <p className="text-sm text-orange-600 font-bold">Rang : {rank}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs">Note finale</p>
          <p className=" font-black text-gray-800">
            {challenge?.typeevaluation?.type === "vote"
              ? Number(project?.score || 0).toFixed(2)
              : Number(project?.notefinale || 0).toFixed(2)}
          </p>
        </div>
      </div>
      {challenge?.typeevaluation?.type != "vote" &&
        project.commentaire_jury && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Commentaire du jury :
            </p>
            <p className="text-sm text-gray-600 italic">
              {isExpanded
                ? project.commentaire_jury
                : `${project.commentaire_jury?.substring(0, 100)}...`}
            </p>
            {project.commentaire_jury?.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-orange-600 text-xs font-bold mt-1"
              >
                {isExpanded ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </div>
        )}
    </Link>
  );
}

// --- COMPOSANT PRINCIPAL ---

const LoginRequiredModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300 relative">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Vous devez être connecté pour participer à ce challenge et soumettre
            votre projet.
          </p>
          <div className="space-y-3">
            <a
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200"
            >
              Se connecter
            </a>
            <a
              href="/auth/register-talent"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-100 hover:border-orange-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              <UserPlus className="w-4 h-4" />
              S'inscrire gratuitement
            </a>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

function ShareModal({ isOpen, onClose, challengeId, onShareSuccess }: any) {
  const [customMessage, setCustomMessage] = useState("");
  if (!isOpen) return null;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/challenge/${challengeId}`
      : "";
  const finalMessage = customMessage
    ? `${customMessage}\n\n${shareUrl}`
    : shareUrl;

  const handleShareAction = (type: "whatsapp" | "facebook" | "copy") => {
    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(finalMessage)}`,
        "_blank",
      );
    } else if (type === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(customMessage)}`,
        "_blank",
      );
    } else if (type === "copy") {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié !");
    }
    onShareSuccess();
    if (type !== "copy") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-xl text-gray-900">
            Partager le challenge
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Message (optionnel)
          </label>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
            rows={3}
            placeholder="Dites quelque chose..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleShareAction("whatsapp")}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 bg-[#25D366] text-white rounded-2xl w-full flex justify-center shadow-lg group-hover:scale-105 transition-transform">
              <MessageCircle fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-gray-600">
              WhatsApp
            </span>
          </button>
          <button
            onClick={() => handleShareAction("facebook")}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 bg-[#1877F2] text-white rounded-2xl w-full flex justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Facebook fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-gray-600">
              Facebook
            </span>
          </button>
          <button
            onClick={() => handleShareAction("copy")}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 bg-gray-800 text-white rounded-2xl w-full flex justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Copy />
            </div>
            <span className="text-[10px] font-black text-gray-600">Lien</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ChallengeClient() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;
  const [showExternalModal, setShowExternalModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [loaderLikeChallenge, setLoaderLikeChallenge] = useState(false);
  const [challengeBestFormat, setChallengeBestFormat] = useState<any>({});
  const [likeursIds, setLikeursIds] = useState<number[]>([]);
  const [suiveurIds, setSuiveurIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const contentAnchorRef = useRef<HTMLDivElement>(null);

  // fonction pour gerer le scroll de l'ecran quand on clique sur un tab
  const handleTabClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    tabId: string,
  ) => {
    // 1. Changer l'onglet actif
    setActiveTab(tabId);

    // 2. Scroll Horizontal du bouton (pour le centrer ou le rendre visible)
    const target = e.currentTarget;
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center", // Centre le tab dans la zone visible horizontalement
    });

    // 3. Scroll Vertical de la page
    // On attend un court instant que l'onglet s'active pour défiler
    setTimeout(() => {
      if (contentAnchorRef.current) {
        const yOffset = -120; // Ajustez cette valeur pour laisser de l'espace en haut (hauteur du menu sticky)
        const element = contentAnchorRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  // modal external link handle function
  const confirmExternalRedirect = () => {
    let url = challenge.site;
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setShowExternalModal(false);
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setCurrentUser(authData.user);
      } catch (e) {
        console.error(e);
      }
    }
    if (challengeId) fetchChallengeDetails();
  }, [challengeId]);

  const fetchChallengeDetails = async () => {
    try {
      const response = await apiFetch(`/challenge/details/${challengeId}`);
      if (response.statut == 200) {
        const challengeData = response?.data?.challenge;

        // ✅ Fusionner les données nouvelles tables + données challenge
        const enrichedChallenge = {
          ...challengeData,
          regles: response.data.regles ?? [],
          recompenses: response.data.recompenses ?? [],
          objectifs: response.data.objectifs ?? [],
          profils: response.data.profils ?? [],
          criteres: response.data.criteres ?? [],
          regions: response.data.regions ?? [],
          jurys: response.data.jurys ?? [],
        };

        setChallenge(enrichedChallenge);
        setChallengeBestFormat({
          id: challengeData.id,
          title: challengeData.titre,
          image: challengeData.photo
            ? `${apifile}/${challengeData.photo}`
            : "/assets/images/innov.jpg",
        });
        setLikeursIds(response.data.likeurs_ids || []);
        setSuiveurIds(response.data.suiveurs_ids || []);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.id === challenge?.user_id;
  const isJury = currentUser
    ? currentUser.id === challenge?.jury_id ||
      (Array.isArray(challenge?.jurys) &&
        challenge.jurys.some((j: any) => j.id === currentUser.id))
    : false;
  const hasLiked = currentUser ? likeursIds.includes(currentUser.id) : false;

  // on choisit le tab actif par defaut en fonction du role du user qui navigue sur TI
  useEffect(() => {
    // On ne change l'onglet que si le challenge est chargé
    if (challenge) {
      if (isOwner) {
        setActiveTab("stats");
      } else if (isJury) {
        setActiveTab("evaluate");
      } else {
        setActiveTab("overview");
      }
    }
  }, [challenge, currentUser, isOwner, isJury]);

  const handleLike = async () => {
    if (!currentUser) return setShowLoginModal(true);

    // 1. On active le loader AVANT toute autre logique
    setLoaderLikeChallenge(true);

    try {
      // 2. La requête réseau
      const response = await apiFetch(`/challenge/like/${challengeId}`);

      if (response.statut === 200) {
        setLikeursIds(response.data.ids_likeurs);
        toast.success(response.message);
      }
    } catch (e) {
      toast.error("Action impossible");
    } finally {
      // 3. On coupe le loader quoi qu'il arrive
      setLoaderLikeChallenge(false);
    }
  };

  const handleParticipate = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (challenge.site?.toLowerCase() === "talent innovant") {
      setShowSubmissionModal(true);
    } else {
      setShowExternalModal(true);
    }
  };

  const handleShareSuccess = async () => {
    if (currentUser) {
      try {
        await apiFetch(`/challenge/partager/${challengeId}`);
      } catch (e) {
        console.error("Erreur increment partage");
      }
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/challenge/delete/${challengeId}`);
      if (res.statut === 200) {
        toast.success(res.message);
        router.back();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-700" size={48} />
      </div>
    );

  const refreshPage = () => {
    window.location.reload();
  };

  if (!challenge)
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">
          Aucun challenge trouvé. Vérifiez votre connexion internet ou essayez
          de rafraîchir la page.
        </p>
        <button
          onClick={refreshPage}
          className="mt-4 bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800"
        >
          Rafraîchir
        </button>
      </div>
    );

  const tabs = [
    (isOwner || isJury) &&
      challenge?.site?.toLowerCase() == "talent innovant" && {
        id: "stats",
        label: "Statistiques",
      },
    (isOwner || isJury) &&
      challenge?.site?.toLowerCase() == "talent innovant" && {
        id: "evaluate",
        label: "Évaluer les projets",
      },
    { id: "overview", label: "Aperçu" },
    challenge?.site?.toLowerCase() == "talent innovant" && {
      id: "projects",
      label: "Projets",
    },
    { id: "rules", label: "Règles" },
    { id: "criteria", label: "Critères" },
    { id: "rewards", label: "Récompenses" },
    challenge?.site?.toLowerCase() == "talent innovant" && {
      id: "participants",
      label: "Participants",
    },
    challenge?.site?.toLowerCase() == "talent innovant" && {
      id: "results",
      label: "Résultats",
    },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster />
      <BackButton m={16} />

      <div className="relative w-full h-70 md:h-80 rounded-b-2xl overflow-hidden shadow mt-6">
        <Image
          src={
            challenge.photo
              ? `${apifile}/${challenge.photo}`
              : "../assets/images/innov.jpg"
          }
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold line-clamp-6">
            {challenge.titre}
          </h1>
          <p className="opacity-80 mt-1 line-clamp-2">{challenge.theme}</p>
        </div>
      </div>

      {challenge?.site?.toLowerCase() != "talent innovant" && (
        <div className="px-4 text-xs text-orange-700 leading-relaxed mt-4">
          <span className="font-semibold underline">NB:</span> Les inscriptions
          et le déroulement de ce challenge se font hors de{" "}
          <span className="font-bold">TALENT INNOVANT</span>.
        </div>
      )}

      <div className="flex flex-row flex-wrap items-center gap-4 px-6 mt-4">
        {(isOwner || isJury) &&
          challenge?.site?.toLowerCase() == "talent innovant" && (
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3 text-orange-700 flex items-center justify-center gap-2 py-3 hover:bg-orange-100 text-gray-700 font-bold rounded-xl transition-all border border-orange-700"
            >
              <Eye size={18} /> Voir le formulaire de participation
            </button>
          )}

        {challenge?.site?.toLowerCase() == "talent innovant" &&
          !isOwner &&
          !isJury && (
            <button
              onClick={handleParticipate}
              className="bg-orange-700 hover:bg-orange-800 text-white md:px-6 md:py-2 px-3 py-2 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95"
            >
              <UserPlus size={18} /> Participer à ce challenge
            </button>
          )}

        {challenge?.site?.toLowerCase() != "talent innovant" && (
          <button
            onClick={handleParticipate}
            className="bg-orange-700 hover:bg-orange-800 text-white md:px-6 md:py-2 px-3 py-2 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95"
          >
            <ExternalLink size={18} /> Aller au challenge
          </button>
        )}
        <button
          onClick={handleLike}
          disabled={loaderLikeChallenge}
          style={{ minWidth: "100px" }} // Ajuste la taille selon ton besoin
          className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all active:scale-95 ${
            hasLiked
              ? "bg-orange-50 border-orange-700 text-orange-700"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {loaderLikeChallenge ? (
            <Loader2 size={18} className="animate-spin text-orange-700" />
          ) : (
            <Heart
              size={18}
              className={hasLiked ? "fill-orange-700 text-orange-700" : ""}
            />
          )}
          <span className="font-bold">{likeursIds?.length}</span>
        </button>

        <ChallengeMoreOptions
          challenge={challenge}
          currentUser={currentUser}
          challengeId={challengeId}
          suiveurs_ids={suiveurIds}
          onShare={() => setShowShareModal(true)}
          userName={currentUser?.talent?.nom || "Talent"}
          userDomain={""}
          userCompetences={""}
        />
        {isOwner && (
          <div className="ml-auto flex gap-3">
            <Link
              href={`/challenge/edit/${challenge?.id}`}
              className="p-2 text-orange-700 hover:bg-orange-100 rounded-lg flex items-center gap-1 border border-orange-200"
            >
              <Pencil size={18} />{" "}
              <span className="hidden md:inline">Modifier</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg flex items-center gap-1 border border-red-200"
            >
              <Trash size={18} />{" "}
              <span className="hidden md:inline">Supprimer</span>
            </button>
          </div>
        )}
      </div>

      <div className="sticky top-0 bg-white z-[40] mt-10 border-b">
        <div className="flex overflow-x-auto no-scrollbar scrollbar-hide scroll-smooth">
          {tabs?.map((t) => (
            <button
              key={t.id}
              onClick={(e) => handleTabClick(e, t.id)}
              className={`px-6 py-3 whitespace-nowrap font-medium border-b-2 transition ${activeTab === t.id ? "border-orange-700 text-orange-700" : "border-transparent text-gray-600 hover:text-black"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentAnchorRef} className="h-1" />

      {!loading && (
        <div className="mt-8 px-3 max-w-7xl mx-auto">
          {activeTab === "stats" && (
            <ChallengeAnalytics challengeId={challenge?.id} />
          )}
          {activeTab === "evaluate" && (
            <EvaluateProjectsSection challenge={challenge} isJury={isJury} />
          )}
          {activeTab === "overview" && (
            <OverviewSection challenge={challenge} />
          )}
          {activeTab === "projects" && (
            <ProjectsSection
              challenge={challenge}
              currentUser={currentUser}
              isOwner={isOwner}
            />
          )}
          {activeTab === "rules" && (
            <ListSection
              title="Règles du challenge"
              data={
                challenge?.regles?.length
                  ? challenge.regles
                  : challenge?.principe
              }
            />
          )}
          {activeTab === "criteria" && (
            <CriteresSection
              criteres={challenge?.criteres}
              ancienData={challenge?.critereevaluation}
            />
          )}
          {activeTab === "rewards" && (
            <ListSection
              title="Récompenses"
              data={
                challenge?.recompenses?.length
                  ? challenge.recompenses
                  : challenge?.recompense
              }
            />
          )}
          {activeTab === "participants" && (
            <ParticipantsSection
              challengeId={challengeId}
              currentUser={currentUser}
            />
          )}
          {activeTab === "results" && (
            <ResultsSection
              challenge={challenge}
              isOwner={isOwner}
              currentUser={currentUser}
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            challengeId={challengeId}
            onShareSuccess={handleShareSuccess}
          />
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash className="text-red-600" size={32} />
              </div>
              <h3 className="font-black text-xl text-gray-900 mb-2">
                Confirmation
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce challenge ? Cette action
                est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition"
                >
                  {deleting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {challenge && (
        <ProjectSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          challenge={challengeBestFormat}
        />
      )}

      {/* preview modal  */}
      <ProjectFormPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        challenge={{ ...challenge, photo: apifile + "/" + challenge?.photo }}
      />

      <BackToTop />

      {/* external redirection modal  */}
      <ExternalRedirectModal
        isOpen={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        onConfirm={confirmExternalRedirect}
        url={challenge?.site}
      />
    </div>
  );
}
// --- SOUS-SECTIONS ---

function CriteresSection({
  criteres,
  ancienData,
}: {
  criteres: any[];
  ancienData?: any;
}) {
  // Nouveau système : critères avec coefficients
  if (criteres && criteres.length > 0) {
    return (
      <div className="w-full py-4">
        <div className="flex items-center gap-2 mb-6 px-1 text-gray-800">
          <h4 className="text-lg font-bold">Critères d'évaluation</h4>
        </div>
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100 bg-white">
          {criteres.map((c: any, i: number) => (
            <div key={i} className="flex gap-4 p-4 items-center">
              <span className="flex-shrink-0 font-mono text-xs text-gray-400 w-6">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                {c.libelle ?? c}
              </p>
              {c.coefficient != null && (
                <span className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                  Coef. {c.coefficient}
                </span>
              )}
            </div>
          ))}
        </div>
        {criteres.some((c: any) => c.coefficient != null) && (
          <div className="mt-3 p-3 bg-white border border-orange-700 rounded-xl text-xs text-orange-700 font-bold text-center">
            📊 Σ(Note × Coefficient) / Σ(Coefficients) par jury → moyenne
            inter-jurys = note finale /20
          </div>
        )}
      </div>
    );
  }

  // Ancien système — fallback sur critereevaluation JSON
  return <ListSection title="Critères d'évaluation" data={ancienData} />;
}

// ──────────────────────────────────────────────────────────────────
// Modal confirmation publication
// ──────────────────────────────────────────────────────────────────
function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-orange-100">
            <Send className="text-orange-700" size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            Publier les résultats définitifs
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
            Cette action rendra les résultats visibles par{" "}
            <span className="font-bold text-slate-700">
              tous les participants{" "}
            </span>
            et ils seront notifiés . Elle est{" "}
            <span className="font-bold">irréversible</span>.
          </p>
        </div>
        <div className="mx-8 mb-6 p-4 bg-white border border-orange-700 rounded-2xl">
          <p className="text-[10px] font-black text-orange-700 uppercase tracking-wider mb-3">
            ⚠️ Avant de confirmer, vérifiez que :
          </p>
          <div className="space-y-2.5">
            {[
              "Tous les projets éligibles ont été évalués",
              "Les notes attribuées sont définitives",
              "Le classement correspond à vos attentes",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-black text-amber-800">
                    {i + 1}
                  </span>
                </div>
                <span className="text-xs text-black font-medium leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isPublishing}
            className="flex-1 py-3.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-200 active:scale-[0.98]"
          >
            {isPublishing ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Publication...
              </>
            ) : (
              <>
                <Send size={16} /> Confirmer
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modal édition des notes par critères — pour le jury connecté
// ✅ onSaved(notefinale) déclenche la mise à jour immédiate dans ProjectCardResult
// ──────────────────────────────────────────────────────────────────
function EditMesNotesModal({
  isOpen,
  onClose,
  postId,
  project,
  mesNotesCriteres,
  commentaireGlobal,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  project: any;
  mesNotesCriteres: any[];
  commentaireGlobal: string;
  onSaved: (
    notefinale: number,
    updatedCriteres: any[],
    newComment: string,
  ) => void;
}) {
  const [notes, setNotes] = useState<
    Record<number, { note: string; commentaire: string }>
  >({});
  const [commentGlobal, setCommentGlobal] = useState(commentaireGlobal ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const init: Record<number, { note: string; commentaire: string }> = {};
    mesNotesCriteres.forEach((c: any) => {
      init[c.critere_id] = {
        note: String(c.note ?? ""),
        commentaire: c.commentaire ?? "",
      };
    });
    setNotes(init);
    setCommentGlobal(commentaireGlobal ?? "");
  }, [isOpen, mesNotesCriteres, commentaireGlobal]);

  if (!isOpen) return null;

  const apercu = (): number | null => {
    let sommePond = 0,
      sommeCoef = 0;
    for (const c of mesNotesCriteres) {
      const note = parseFloat(notes[c.critere_id]?.note ?? "");
      if (isNaN(note)) return null;
      const coef = c.coefficient ?? 1;
      sommePond += note * coef;
      sommeCoef += coef;
    }
    return sommeCoef > 0 ? Math.round((sommePond / sommeCoef) * 100) / 100 : 0;
  };

  const handleSave = async () => {
    for (const c of mesNotesCriteres) {
      const note = parseFloat(notes[c.critere_id]?.note ?? "");
      if (isNaN(note) || note < 0) {
        toast.error(`Note manquante : ${c.libelle}`);
        return;
      }
      if (note > 20) {
        toast.error(`"${c.libelle}" : max 20`);
        return;
      }
    }

    setLoading(true);
    const t = toast.loading("Enregistrement...");
    try {
      const res = await apiFetch("/challenge/modifier-mes-notes-de-post", {
        method: "POST",
        body: JSON.stringify({
          post_id: postId,
          notes: mesNotesCriteres.map((c: any) => ({
            critere_id: c.critere_id,
            note: parseFloat(notes[c.critere_id]?.note ?? "0"),
            commentaire: notes[c.critere_id]?.commentaire ?? "",
          })),
          commentaire_global: commentGlobal,
        }),
      });

      if (res?.statut === 200) {
        toast.success(
          `Notes mises à jour — Nouvelle note finale : ${res.note_finale}/20`,
          { id: t },
        );

        const freshCriteres = mesNotesCriteres.map((c: any) => ({
          ...c,
          note: parseFloat(notes[c.critere_id]?.note ?? "0"),
          commentaire: notes[c.critere_id]?.commentaire ?? "",
        }));

        // ✅ Appeler onSaved avec TOUTES les infos
        // @ts-ignore (si tu n'as pas encore mis à jour les types)
        onSaved(res.note_finale, freshCriteres, commentGlobal);
        onClose();
      } else {
        toast.error(res?.message || "Erreur", { id: t });
      }
    } catch {
      toast.error("Erreur réseau", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const ap = apercu();

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-orange-700" />
            <div>
              <h3 className="font-black text-slate-800 text-sm leading-tight">
                Modifier mes notes
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                {project?.user?.talent?.nom ??
                  project?.user?.name ??
                  "Participant"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mesNotesCriteres.length === 0 ? (
            <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertCircle
                size={16}
                className="text-amber-600 mt-0.5 shrink-0"
              />
              <p className="text-sm text-amber-700 font-medium">
                Vous n'avez pas encore noté ce projet. Utilisez "Évaluer" pour
                une première notation.
              </p>
            </div>
          ) : (
            <>
              {mesNotesCriteres.map((c: any) => (
                <div
                  key={c.critere_id}
                  className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 flex-1 pr-2">
                      {c.libelle}
                    </p>
                    <span className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full shrink-0">
                      Coef. {c.coefficient ?? 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      placeholder="/20"
                      value={notes[c.critere_id]?.note ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [c.critere_id]: {
                            ...prev[c.critere_id],
                            note: e.target.value,
                          },
                        }))
                      }
                      className="w-20 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold focus:border-orange-700 focus:ring-1 focus:ring-orange-200 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Commentaire (optionnel)"
                      value={notes[c.critere_id]?.commentaire ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [c.critere_id]: {
                            ...prev[c.critere_id],
                            commentaire: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-orange-700"
                    />
                  </div>
                </div>
              ))}

              {/* Aperçu moyenne */}
              {ap !== null && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                    Ma nouvelle moyenne pondérée
                  </p>
                  <p className="text-2xl font-black text-orange-700">
                    {ap}
                    <span className="text-sm font-normal">/20</span>
                  </p>
                </div>
              )}

              {/* Commentaire global */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Mon avis global
                </label>
                <textarea
                  rows={3}
                  value={commentGlobal}
                  onChange={(e) => setCommentGlobal(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-orange-400 outline-none text-sm resize-none"
                  placeholder="Avis général sur ce projet..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {mesNotesCriteres.length > 0 && (
          <div className="px-6 pb-6 shrink-0">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-orange-700 hover:bg-orange-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-orange-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />{" "}
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} /> Enregistrer mes modifications
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ──────────────────────────────────────────────────────────────────
function EvaluateProjectsSection({ challenge, isJury }: any) {
  const [activeSubTab, setActiveSubTab] = useState(
    challenge?.typeevaluation?.type?.toLowerCase() !== "vote"
      ? "a_evaluer"
      : "provisoire",
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [resultatDisponible, setResultatDisponible] = useState(
    challenge?.resultatdisponible,
  );

  // Sous-tab IA (uniquement dans a_evaluer)
  const [activeEligibiliteTab, setActiveEligibiliteTab] = useState<
    "eligibles" | "non_eligibles"
  >("eligibles");

  const [editModal, setEditModal] = useState<{
    open: boolean;
    project: any;
    mesNotesCriteres: any[];
    commentaireGlobal: string;
    onSaved: (n: number, criteres: any[], comment: string) => void;
  }>({
    open: false,
    project: null,
    mesNotesCriteres: [],
    commentaireGlobal: "",
    onSaved: () => {},
  });

  const dateFin = new Date(challenge?.datefin).getTime();
  const maintenant = new Date().getTime();

  const fetchEvalData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === "a_evaluer") {
        const res = await apiFetch(
          `/challenge/posts-a-evaluer/${challenge?.id}`,
        );
        const data = res.posts_a_evaluer ?? res.top_posts ?? [];
        setProjects(data.sort((a: any, b: any) => b?.score - a?.score));
      } else {
        const res = await apiFetch(
          `/posts/listeposts-evalues/${challenge?.id}`,
        );
        const data = (res.data ?? [])
          .filter((p: any) => p?.notefinale != null)
          .sort((a: any, b: any) => b?.notefinale - a?.notefinale);
        setProjects(data);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalData();
  }, [activeSubTab, challenge.id]);

  // ── Séparation locale des projets par éligibilité ──
  // null est traité comme éligible (pas encore analysé par l'IA)
  const projetsEligibles = projects.filter((p) => p.eligible !== 0);
  const projetsNonEligibles = projects.filter((p) => p.eligible === 0);

  const handlePublishResults = async () => {
    if (!challenge?.id) return;
    setIsPublishing(true);
    const t = toast.loading("Publication...");
    try {
      const auth = localStorage.getItem("auth");
      const token = auth ? JSON.parse(auth).token : null;
      const res = await fetch(
        `${API_BASE_URL}/challenge/publier-resultats/${challenge?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      const data = await res.json();
      if (data.statut === 200) {
        toast.success(data.message, { id: t, duration: 6000 });
        setResultatDisponible(1);
        setShowPublishConfirm(false);
      } else {
        toast.error(data.message || "Erreur", { id: t });
      }
    } catch {
      toast.error("Erreur de connexion", { id: t });
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish =
    resultatDisponible != 1 &&
    !(
      dateFin > maintenant &&
      challenge?.typeevaluation?.type?.toLowerCase() === "vote"
    );

  const formatDate = (d: any) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));

  // Projets à afficher selon le sous-tab IA actif
  const projetsAffiches =
    activeEligibiliteTab === "eligibles"
      ? projetsEligibles
      : projetsNonEligibles;

  return (
    <div className="space-y-6">
      {/* Onglets principaux + bouton publier */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 p-1 bg-gray-200 rounded-xl w-fit">
          {challenge?.typeevaluation?.type !== "vote" && (
            <button
              onClick={() => setActiveSubTab("a_evaluer")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeSubTab === "a_evaluer"
                  ? "bg-white text-orange-700 shadow"
                  : "text-gray-500"
              }`}
            >
              À évaluer
            </button>
          )}
          <button
            onClick={() => setActiveSubTab("provisoire")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === "provisoire"
                ? "bg-white text-orange-700 shadow"
                : "text-gray-500"
            }`}
          >
            Résultats provisoires
          </button>
        </div>

        {activeSubTab === "provisoire" && (
          <button
            onClick={() => {
              if (canPublish) setShowPublishConfirm(true);
            }}
            disabled={!canPublish || isPublishing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              challenge?.resultatdisponible == 1
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : !canPublish
                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  : "bg-orange-700 text-white hover:bg-orange-800 shadow-lg active:scale-[0.98]"
            }`}
          >
            {resultatDisponible == 1 ? (
              <>
                <CheckCircle size={16} /> RÉSULTATS PUBLIÉS
              </>
            ) : (
              <>
                <Send size={16} /> PUBLIER LES RÉSULTATS
              </>
            )}
          </button>
        )}
      </div>

      {/* ── SOUS-TABS ÉLIGIBILITÉ (uniquement dans a_evaluer) ── */}
      {activeSubTab === "a_evaluer" && !loading && (
        <div className="flex gap-2 border-b border-gray-100 pb-0">
          <button
            onClick={() => setActiveEligibiliteTab("eligibles")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeEligibiliteTab === "eligibles"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-black">
              ✓
            </span>
            Projets conformes
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeEligibiliteTab === "eligibles"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {projetsEligibles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveEligibiliteTab("non_eligibles")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeEligibiliteTab === "non_eligibles"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-black">
              ✕
            </span>
            Projets non conformes
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeEligibiliteTab === "non_eligibles"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {projetsNonEligibles.length}
            </span>
          </button>
        </div>
      )}

      {/* Message contextuel hybride */}
      {challenge?.typeevaluation?.type?.toLowerCase() === "hybride" &&
        dateFin > maintenant &&
        activeSubTab === "a_evaluer" && (
          <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
            NB : Les notations commencent le{" "}
            <span className="font-bold">{formatDate(challenge?.datefin)}</span>{" "}
            (fin des votes).
          </p>
        )}

      {/* Message aucun projet à évaluer */}
      {!loading &&
        projetsAffiches.length === 0 &&
        activeSubTab === "a_evaluer" && (
          <div className="py-16 text-center border-2 border-dashed border-green-100 rounded-3xl bg-green-50/30">
            <CheckCircle className="text-green-500 mx-auto mb-3" size={36} />
            <p className="font-bold text-green-700 text-sm">
              {activeEligibiliteTab === "eligibles"
                ? "Vous avez évalué tous les projets conformes !"
                : "Aucun projet non conforme détecté."}
            </p>
            {activeEligibiliteTab === "eligibles" && (
              <p className="text-green-600 text-xs mt-1">
                Consultez les résultats provisoires ci-dessus.
              </p>
            )}
          </div>
        )}

      {/* Grille de projets */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-orange-700" size={40} />
        </div>
      ) : projetsAffiches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
          {activeSubTab === "a_evaluer"
            ? activeEligibiliteTab === "eligibles"
              ? // Projets conformes → carte normale cliquable
                projetsAffiches.map((p) => (
                  <ProjectCardToEvaluate
                    key={p.id}
                    project={p}
                    allProjects={projects}
                    challenge={challenge}
                    onEvaluate={() => setSelectedProjectId(p.id)}
                  />
                ))
              : // Projets non conformes → carte avec raison IA
                projetsAffiches.map((p) => (
                  <div key={p.id} className="relative">
                    <ProjectCardToEvaluate
                      project={p}
                      allProjects={projects}
                      challenge={challenge}
                      onEvaluate={() => setSelectedProjectId(p.id)}
                    />
                    {/* Bandeau raison non-éligibilité */}
                    {p.resultats && p.resultats !== "Approuvé par IA" && (
                      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                        <span className="shrink-0 mt-0.5 text-red-500 text-xs font-black">
                          IA
                        </span>
                        <p className="text-xs text-red-600 leading-relaxed">
                          {p.resultats}
                        </p>
                      </div>
                    )}
                  </div>
                ))
            : // Tab provisoire — inchangé
              projetsAffiches.map((p) => (
                <ProjectCardResult
                  key={p.id}
                  project={p}
                  challenge={challenge}
                  isJury={isJury}
                  onEditNotes={(
                    proj: any,
                    onSavedCardCallback: (n: number) => void,
                  ) => {
                    setEditModal({
                      open: true,
                      project: proj,
                      mesNotesCriteres: proj.mes_notes_criteres ?? [],
                      commentaireGlobal:
                        proj.commentairejury?.[0]?.commentairejury ?? "",
                      onSaved: (
                        newNote: number,
                        updatedCriteres: any[],
                        newComment: string,
                      ) => {
                        setProjects((prev) =>
                          prev.map((item) =>
                            item.id === proj.id
                              ? {
                                  ...item,
                                  notefinale: newNote,
                                  mes_notes_criteres: updatedCriteres,
                                  commentairejury: [
                                    { commentairejury: newComment },
                                  ],
                                }
                              : item,
                          ),
                        );
                        onSavedCardCallback(newNote);
                      },
                    });
                  }}
                />
              ))}
        </div>
      ) : null}

      {/* Modal évaluation */}
      {selectedProjectId !== null && activeSubTab === "a_evaluer" && (
        <EvaluateProjectModal
          challenge={challenge}
          initialProjectId={selectedProjectId}
          projectsList={projects}
          onClose={() => setSelectedProjectId(null)}
          onProjectEvaluated={(id: number) =>
            setProjects((prev) => prev.filter((item) => item.id !== id))
          }
        />
      )}

      {/* Modal confirmation publication */}
      <AnimatePresence>
        {showPublishConfirm && (
          <PublishConfirmModal
            isOpen={showPublishConfirm}
            onClose={() => setShowPublishConfirm(false)}
            onConfirm={handlePublishResults}
            isPublishing={isPublishing}
          />
        )}
      </AnimatePresence>

      {/* Modal édition notes critères */}
      <AnimatePresence>
        {editModal.open && (
          <EditMesNotesModal
            isOpen={editModal.open}
            onClose={() => setEditModal((p) => ({ ...p, open: false }))}
            postId={editModal.project?.id}
            project={editModal.project}
            mesNotesCriteres={editModal.mesNotesCriteres}
            commentaireGlobal={editModal.commentaireGlobal}
            onSaved={editModal.onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewSection({ challenge }: any) {
  // OverviewSection — Jury, Objectifs, Profils avec fallback
  // ── Rendu du/des jury(s) ──
  const renderJury = (challenge: any) => {
    console.log(challenge.jurys);
    // Nouveau système : tableau jurys
    if (
      challenge?.jurys &&
      Array.isArray(challenge.jurys) &&
      challenge.jurys.length > 0
    ) {
      return (
        <div className="flex flex-wrap gap-4">
          {challenge.jurys.map((jury: any) => {
            const nom =
              jury.statut === "talent"
                ? (jury.nom ?? jury.email)
                : (jury.nom ?? jury.email);
            return (
              <Link
                href={
                  jury?.statut === "talent"
                    ? `/profil-talent/${jury.id}`
                    : `/profil-entreprise/${jury.id}`
                }
                key={jury.id}
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl"
              >
                {jury.pp && (
                  <img
                    src={
                      String(jury.pp).startsWith("http")
                        ? jury.pp
                        : `${apifile}/${jury.pp}`
                    }
                    className="w-6 h-6 rounded-full object-cover border border-orange-200"
                    alt={nom}
                  />
                )}
                <span className="text-sm font-bold text-slate-800">{nom}</span>
              </Link>
            );
          })}
        </div>
      );
    }

    // Ancien système : jury_id
    const jury = challenge?.jury;
    if (!jury) {
      return (
        <p className="text-gray-500 italic text-sm">
          Le jury sera communiqué prochainement par l'organisateur.
        </p>
      );
    }
    const nom =
      jury.statut === "talent"
        ? (jury.talent?.nom ?? jury.email)
        : (jury.entreprise?.nom ?? jury.email);
    return <p className="text-gray-700 font-bold">{nom}</p>;
  };

  // ── Rendu des objectifs (liste à puces) ──
  const renderObjectifs = (challenge: any) => {
    let items: string[] = [];

    // Nouveau système : tableau objectifs
    if (
      challenge?.objectifs &&
      Array.isArray(challenge.objectifs) &&
      challenge.objectifs.length > 0
    ) {
      items = challenge.objectifs;
    } else if (challenge?.objectif) {
      // Ancien système — peut être séparé par " | "
      const split = challenge.objectif
        .split(" | ")
        .map((s: string) => s.trim())
        .filter(Boolean);
      items = split.length > 1 ? split : [challenge.objectif];
    }

    if (items.length === 0) {
      return (
        <p className="text-gray-700 leading-relaxed">
          Atteindre les meilleurs résultats selon les critères définis.
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {items.map((obj: string, i: number) => (
          <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-orange-700 rounded-full mt-1.5 shrink-0" />
            {obj}
          </li>
        ))}
      </ul>
    );
  };

  // ── Rendu des profils recherchés (liste à puces) ──
  const renderProfils = (challenge: any) => {
    let items: string[] = [];

    if (
      challenge?.profils &&
      Array.isArray(challenge.profils) &&
      challenge.profils.length > 0
    ) {
      items = challenge.profils;
    } else if (challenge?.publiccible) {
      try {
        const parsed =
          typeof challenge.publiccible === "string"
            ? JSON.parse(challenge.publiccible)
            : challenge.publiccible;
        items = Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        items = [challenge.publiccible];
      }
    }

    if (!items || items.length === 0) return null;

    return (
      <ul className="space-y-1">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-gray-700 text-sm flex items-center gap-2">
            <div className="w-1 h-1 bg-orange-700 rounded-full shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  };

  // Fonction pour expliquer le type d'évaluation
  const getEvaluationDescription = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hybride":
        return "Processus en deux étapes : d'abord, une sélection basée sur la popularité (votes, commentaires, partages). Ensuite, un jury d'experts évalue les meilleurs projets pour désigner les lauréats finaux.";
      case "vote":
        return "Le classement final repose exclusivement sur l'engagement du public. Les projets ayant reçu le plus de votes et de réactions remportent le challenge.";
      case "jury":
        return "Une évaluation rigoureuse effectuée par des experts désignés. Ils notent les projets selon les critères définis.";
      default:
        return "L'évaluation suit les règles spécifiques définies par l'organisateur du challenge.";
    }
  };

  // Fonction pour expliquer la portée
  const getPorteeDescription = (portee: string) => {
    return portee?.toLowerCase() === "public"
      ? "Visibilité totale : tous les utilisateurs peuvent consulter les projets après la clôture des inscriptions (ou soumissions de projets)."
      : "Visibilité restreinte : seuls l'organisateur et les membres autorisés peuvent consulter les projets soumis. Cependant, tout le monde peut voir le classement final des vainqueurs (dans la section RESULTATS) sans leurs projets.";
  };

  // Logique pour extraire le nom du jury proprement
  const getJuryName = () => {
    const jury = challenge?.jury;
    if (!jury)
      return "Le jury sera communiqué prochainement par l'organisateur.";

    if (jury?.statut == "talent") {
      return jury.talent?.nom || jury.email;
    } else if (jury.statut == "entreprise") {
      return jury.entreprise?.nom || jury.email;
    }
    return jury?.name || jury?.email;
  };

  const datelancement = challenge?.datelancement
    ? new Date(challenge.datelancement).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "la date de lancement du challenge";

  const datefininscription = challenge?.datefininscription
    ? new Date(challenge?.datefininscription).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "la date de fin des inscriptions";

  const datefin = challenge?.datefin
    ? new Date(challenge?.datefin).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "la date de fin du challenge";

  const renderGagnantsDescription = () => {
    try {
      // 1. Transformer le string en véritable tableau JS
      const data =
        typeof challenge?.nombregagnant === "string"
          ? JSON.parse(challenge.nombregagnant)
          : challenge?.nombregagnant;

      // Vérifier si c'est un tableau valide
      if (!Array.isArray(data) || data?.length === 0) return "Non défini";

      // 2. Cas : Tableau à 2 entrées (ex: ["8", "10"])
      if (data?.length >= 2) {
        return (
          <div className="space-y-1">
            <p className="text-gray-700 text-sm">
              <span className="font-bold">{data[0]}</span> finalistes pour la
              première phase (vote)
            </p>
            <p className="text-gray-700 text-sm">
              <span className="font-bold">{data[1]}</span> gagnants finaux
              délibérés par un jury d'experts
            </p>
          </div>
        );
      }

      // 3. Cas : Tableau à 1 seule entrée (ex: ["5"])
      return (
        <span className="text-gray-700 text-sm">
          <span className="font-bold">{data[0]}</span> gagnant(s) au final
        </span>
      );
    } catch (e) {
      // En cas d'erreur de parsing ou format inattendu
      return (
        <span className="text-gray-700 text-sm">
          {challenge?.nombregagnant || "Non défini"}
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 md:space-y-5">
      {/* 1. Thème, Description et Objectifs */}
      <div className="space-y-6">
        <div>
          <h3 className="text-black font-extrabold flex items-center gap-2 mb-2 first-letter:uppercase tracking-tight">
            <Globe size={18} className="text-orange-600" /> Thème
          </h3>
          <p className="text-gray-700 font-medium">{challenge?.theme || ""}</p>
        </div>

        <div>
          <h3 className="text-black font-extrabold flex items-center gap-2 mb-2 first-letter:uppercase tracking-tight">
            <Pencil size={18} className="text-orange-600" /> Description
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {challenge?.description}
          </p>
        </div>

        <div>
          <h3 className="text-black font-extrabold flex items-center gap-2 mb-2 first-letter:uppercase tracking-tight">
            <Trophy size={18} className="text-orange-600" /> Objectifs
          </h3>

          {renderObjectifs(challenge)}
        </div>
      </div>

      {challenge?.site?.toLowerCase() == "talent innovant" && (
        <div className="mt-8">
          <span className="text-black flex flex-row font-extrabold flex items-center gap-2 mb-3 first-letter:uppercase tracking-tight">
            <Star size={18} className="text-orange-600" /> Type d'évaluation des
            projets :
          </span>
          <span className="text-orange-700 relative -top-2 text-sm uppercase font-bold">
            {challenge?.typeevaluation?.type}
          </span>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {getEvaluationDescription(challenge?.typeevaluation?.type)}
          </p>
        </div>
      )}

      {/* 2. Informations Clés en Grille */}
      <div className="pt-8 border-t border-gray-50">
        <h3 className="text-black font-extrabold flex items-center gap-2 mb-6 first-letter:uppercase tracking-tight">
          <Info size={18} className="text-orange-600" /> Informations générales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
          {/* Colonne 1 : Dates & Lieu */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm first-letter:uppercase">
                Début du challenge
              </span>
              <span className="text-gray-700 text-sm">{datelancement}</span>
            </div>
            {challenge?.typeevaluation?.type?.toLowerCase() != "hybride" && (
              <div className="flex flex-col">
                <span className="text-black font-bold text-sm first-letter:uppercase">
                  Fin du challenge
                </span>
                <span className="text-gray-700 text-sm">{datefin}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm first-letter:uppercase">
                Fin des soumissions de projets{" "}
                {(challenge?.typeevaluation?.type?.toLowerCase() == "vote" ||
                  challenge?.typeevaluation?.type?.toLowerCase() ==
                    "hybride") &&
                  " et début des votes"}{" "}
                {challenge?.typeevaluation?.type?.toLowerCase() == "jury" &&
                  " et début des évaluations des projets"}{" "}
              </span>
              <span className="text-gray-700 text-sm">
                {datefininscription}
              </span>
            </div>
            {challenge?.typeevaluation?.type?.toLowerCase() == "hybride" && (
              <div className="flex flex-col">
                <span className="text-black font-bold text-sm first-letter:uppercase">
                  Fin des votes et début des évaluations
                </span>
                <span className="text-gray-700 text-sm">{datefin}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm first-letter:uppercase">
                Lieu
              </span>
              <span className="text-gray-700 text-sm capitalize">
                {challenge?.lieu}
              </span>
            </div>
          </div>

          {/* Colonne 2 : Accès, Participation & Gagnants */}
          <div className="space-y-4">
            {challenge?.site?.toLocaleLowerCase() == "talent innovant" && (
              <div className="flex flex-col">
                <span className="text-black font-bold text-sm first-letter:uppercase">
                  Site
                </span>
                <span className="text-gray-700 text-sm">
                  {challenge?.site || "Plateforme Talent Innovant"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm first-letter:uppercase">
                Soumissions autorisées
              </span>
              <span className="text-gray-700 text-sm">
                {challenge?.nombrecontribution || 1} projet(s) au max par
                participant
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm first-letter:uppercase mb-1">
                Nombre de gagnants finaux
              </span>
              {renderGagnantsDescription()}
            </div>
          </div>

          {/* Colonne 3 : Public cible & Domaines */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-black font-bold text-sm mb-2 first-letter:uppercase">
                Public cible
              </span>
              <ul className="space-y-1">{renderProfils(challenge)}</ul>
            </div>

            <div className="flex flex-col">
              <span className="text-black font-bold text-sm mb-2 first-letter:uppercase">
                Domaines concernés
              </span>
              <ul className="space-y-1">
                {challenge?.domaines?.map((domaine: any, index: number) => (
                  <li
                    key={index}
                    className="text-gray-700 text-sm flex items-center gap-2"
                  >
                    <div className="w-1 h-1 bg-orange-700 rounded-full" />{" "}
                    {domaine.nom}
                  </li>
                ))}
                {(!challenge?.domaines ||
                  challenge?.domaines?.length === 0) && (
                  <li className="text-gray-700 text-sm">Tous domaines</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {challenge?.details && (
        <div className="space-y-4 mt-5">
          <div className="flex flex-col">
            <span className="text-black font-bold text-sm first-letter:uppercase">
              Détails supplémentaires
            </span>
            <span className="text-gray-700 text-sm">
              {challenge?.details || ""}
            </span>
          </div>
        </div>
      )}

      {challenge?.site?.toLowerCase() == "talent innovant" && (
        <>
          <div className="pt-7 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-black font-extrabold flex items-center gap-2 mb-3 first-letter:uppercase tracking-tight">
                <ShieldCheck size={18} className="text-orange-600" /> Portée :{" "}
                {challenge.portee?.portee}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {getPorteeDescription(challenge?.portee?.portee)}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50">
            <h3 className="text-black font-extrabold flex items-center gap-2 mb-3 first-letter:uppercase tracking-tight">
              <UserCheck size={18} className="text-orange-600" /> Jury
            </h3>
            {renderJury(challenge)}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectsSection({ challenge, currentUser, isOwner }: any) {
  const [activeSubTab, setActiveSubTab] = useState("tous");
  const [data, setData] = useState({ posts: [], top_posts: [], my_posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const jsonAll = currentUser
          ? await apiFetch(`/challenge/posts/${challenge?.id}`)
          : { posts: [], top_posts: [] };
        let jsonMy = { data: [] };
        if (currentUser) {
          jsonMy = await apiFetch(`/challenge/myposts/${challenge?.id}`);
        }

        const myPosts = jsonMy.data || [];
        setData({
          posts: jsonAll.posts || [],
          top_posts: jsonAll.top_posts || [],
          my_posts: myPosts,
        });

        // Si l'utilisateur a des projets, on le place par défaut sur cet onglet
        if (myPosts?.length > 0) {
          setActiveSubTab("mes");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProj();
  }, [challenge?.id, currentUser]);

  const canView = !(challenge?.portee?.portee == "privee" && !isOwner);
  const isRegistrationClosed =
    new Date() > new Date(challenge?.datefininscription);
  const formattedDate = new Date(
    challenge?.datefininscription,
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasMyProjects = data?.my_posts?.length > 0;

  // 1. Pendant le chargement, on affiche uniquement le loader pour éviter le "saut" de contenu
  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="animate-spin text-orange-700" size={40} />
      </div>
    );
  }

  // 2. Une fois chargé, on définit la logique d'affichage finale
  return (
    <div className="space-y-6">
      {!currentUser && (
        <div className="p-10 bg-orange-50 rounded-2xl text-center border-2 border-dashed border-orange-200">
          <Lock className="mx-auto mb-3 text-orange-600" size={32} />
          <p className="font-bold text-black mb-6">
            Connectez-vous pour voir les projets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-orange-700 text-white rounded-full font-bold text-sm hover:bg-orange-800 transition-colors w-full sm:w-auto"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register-talent"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}

      {currentUser && !canView && (
        <div className="p-10 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-orange-700">
          <Lock className="mx-auto mb-3 text-orange-700" />
          <p className="font-bold text-black">
            Ce challenge est privé. Seul le créateur peut visualiser les projets
            soumis.
          </p>
        </div>
      )}

      {/* MESSAGE D'ATTENTE : S'affiche UNIQUEMENT si l'utilisateur n'est pas owner ET n'a aucun projet soumis */}
      {currentUser &&
        canView &&
        !isRegistrationClosed &&
        !isOwner &&
        !hasMyProjects && (
          <div className="p-10 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-orange-700">
            <Clock className="mx-auto mb-3 text-orange-700" />
            <p className="font-bold text-black">
              Les projets seront visibles à partir du {formattedDate}
              {challenge?.typeevaluation?.type != "jury" &&
                ", Date à laquelle commencent les votes."}
            </p>
          </div>
        )}

      {/* SECTION PROJETS : S'affiche si la date est passée, si on est owner, OU si on a nos propres projets */}
      {currentUser &&
        canView &&
        (isRegistrationClosed || isOwner || hasMyProjects) && (
          <>
            {/* Notes administratives ou informatives */}
            {!isRegistrationClosed && !isOwner && hasMyProjects && (
              <p className="text-sm font-bold text-orange-700 italic mb-4">
                Note : Vous visualisez vos projets soumis. Les projets des
                autres participants seront visibles le {formattedDate}
                {challenge?.typeevaluation?.type != "jury" &&
                  ", Date à laquelle commencent les votes."}
              </p>
            )}

            {/* Onglets (SubTabs) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
              {hasMyProjects && (
                <button
                  onClick={() => setActiveSubTab("mes")}
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeSubTab === "mes" ? "bg-orange-700 text-white" : "bg-white border text-gray-600"}`}
                >
                  Mes projets ({data?.my_posts?.length})
                </button>
              )}
              <button
                disabled={!isRegistrationClosed && !isOwner}
                onClick={() => setActiveSubTab("tous")}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeSubTab === "tous" ? "bg-orange-700 text-white" : "bg-white border text-gray-600"} ${!isRegistrationClosed && !isOwner ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Tous les projets ({data?.posts?.length})
              </button>
              <button
                disabled={!isRegistrationClosed && !isOwner}
                onClick={() => setActiveSubTab("populaires")}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeSubTab === "populaires" ? "bg-orange-700 text-white" : "bg-white border text-gray-600"} ${!isRegistrationClosed && !isOwner ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Plus populaires ({data?.top_posts?.length})
              </button>
            </div>

            {/* Grille de projets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                let currentData: any[] = [];
                if (activeSubTab === "mes") currentData = data?.my_posts;
                else if (isRegistrationClosed || isOwner) {
                  currentData =
                    activeSubTab === "populaires"
                      ? data?.top_posts
                      : data?.posts;
                }

                if (currentData?.length === 0) {
                  return (
                    <div className="col-span-full text-center py-10 text-gray-500 font-bold text-sm">
                      Aucun projet à afficher.
                    </div>
                  );
                }

                return currentData?.map((p: any) => (
                  <ProjectCard key={p.id} project={p} challenge={challenge} />
                ));
              })()}
            </div>
          </>
        )}
    </div>
  );
}

function ListSection({ title, data }: { title: string; data: any }) {
  const items = useMemo(() => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [data];
      }
    }
    return Array.isArray(data) ? data : Object.values(data || {});
  }, [data]);

  // Sélection de l'icône appropriée selon le titre
  const getIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("récompense"))
      return <Trophy size={20} className="text-orange-700" />;
    if (t.includes("critère"))
      return <Pencil size={20} className="text-orange-700" />;
    if (t.includes("règle"))
      return <ListOrdered size={20} className="text-orange-700" />;
    return <Trophy size={20} className="text-gray-500" />;
  };

  return (
    <div className="w-full py-4">
      {/* En-tête : Icône + Titre */}
      <div className="flex items-center gap-2 mb-6 px-1 text-gray-800">
        {getIcon()}
        <h4 className="text-lg font-bold">{title}</h4>
      </div>

      {/* Liste épurée ligne par ligne */}
      <div className="divide-y divide-gray-100 border-t border-b border-gray-100 bg-white">
        {items?.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className="flex gap-4 p-4 items-start">
              <span className="flex-shrink-0 font-mono text-xs text-gray-400 mt-1">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm italic">
            Aucune information disponible.
          </div>
        )}
      </div>
    </div>
  );
}

function ParticipantsSection({
  challengeId,
  currentUser,
}: {
  challengeId: string;
  currentUser: any;
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      apiFetch(`/challenge/participants/${challengeId}`)
        .then((d) => {
          setList(d.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [challengeId]);

  return (
    <div className="w-full py-4">
      {/* En-tête : Icône + Nombre + Participants */}
      {!loading && currentUser && (
        <div className="flex items-center gap-2 mb-6 px-1 text-gray-800">
          <Users size={20} className="text-gray-500 text-orange-700" />
          <h4 className="text-lg font-bold">
            {list?.length} participant{list?.length > 1 ? "s" : ""}
          </h4>
        </div>
      )}

      {!currentUser && (
        <div className="p-10 bg-orange-50 rounded-2xl text-center border-2 border-dashed border-orange-200">
          <Lock className="mx-auto mb-3 text-orange-600" size={32} />
          <p className="font-bold text-black mb-6">
            Connectez-vous pour voir les participants.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-orange-700 text-white rounded-full font-bold text-sm hover:bg-orange-800 transition-colors w-full sm:w-auto"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register-talent"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}

      {/* Liste sur toute la largeur */}
      <div className="divide-y divide-gray-100 border-t border-b border-gray-100 bg-white">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : list?.length > 0 ? (
          list?.map((p: any, i) => (
            <div
              key={i}
              onClick={() => router.push(`/profil-talent/${p.user?.id}`)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer w-full group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar ou Icône Fallback */}
                <div className="flex-shrink-0">
                  <Image
                    src={
                      p.user?.pp
                        ? `${apifile}/${p.user.pp}`
                        : "../assets/images/pp2.png"
                    }
                    alt="pp"
                    width={44}
                    height={44}
                    className="rounded-full w-11 h-11 object-cover border border-gray-100"
                  />
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-gray-900 capitalize truncate">
                    {p.talent?.nom?.length > 20
                      ? p.talent?.nom.substring(0, 20) + "..."
                      : p.talent?.nom || "Participant"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-tight">
                    {p.talent?.profession?.length > 30
                      ? p.talent?.profession.substring(0, 30) + "..."
                      : p.talent?.profession || "Innovateur"}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1"
              />
            </div>
          ))
        ) : (
          currentUser && (
            <div className="py-10 text-center text-gray-400 text-sm">
              Aucun participant enregistré.
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ResultsSection({ challenge, isOwner, currentUser }: any) {
  const [results, setResults] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("winners");
  const [loading, setLoading] = useState(true);

  const renderNombreGagnant = () => {
    try {
      // 1. On récupère la donnée brute
      const brute = challenge?.nombregagnant;
      if (!brute) return;

      // 2. On transforme en data exploitable (parse si string, sinon garde tel quel)
      const data = typeof brute === "string" ? JSON.parse(brute) : brute;

      // 3. Extraction de la valeur
      let valeur;
      if (Array.isArray(data)) {
        valeur = data.at(-1); // Prend le dernier élément si c'est un tableau
      } else {
        valeur = data; // Prend la valeur directe si c'est un nombre ou un objet
      }

      // 4. Conversion forcée en nombre pour éviter les mauvaises surprises
      return Number(valeur) || 0;
    } catch (e) {
      console.error("Erreur de parsing nombregagnant:", e);
      return 0;
    }
  };

  const limit = renderNombreGagnant();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        let criteria = "";

        if (
          challenge?.typeevaluation == "vote" ||
          challenge?.typeevaluation?.type == "vote"
        ) {
          endpoint = `/challenge/posts/${challenge.id}`;
          criteria = "score";
        } else {
          endpoint = `/posts/listepostsnotes/${challenge.id}`;
          criteria = "notefinale";
        }

        const response = await apiFetch(endpoint);

        let dataToSort = [];
        if (response?.posts) {
          dataToSort = response?.posts;
        } else if (response?.data) {
          dataToSort = response?.data;
        } else {
          dataToSort = response;
        }

        const sorted = [...dataToSort].sort((a: any, b: any) => {
          const valA = a[criteria] || 0;
          const valB = b[criteria] || 0;
          return valB - valA;
        });

        setResults(sorted as any);
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats :", error);
      } finally {
        setLoading(false);
      }
    };

    if (challenge?.id && currentUser) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [challenge]);

  if (
    (challenge?.resultatdisponible != "1" &&
      challenge?.typeevaluation?.type != "vote") ||
    (challenge?.typeevaluation?.type == "vote" &&
      challenge?.datefin > new Date().toISOString() &&
      challenge?.resultatdisponible != "1")
  ) {
    return (
      <div className="p-10 md:p-20 text-center text-gray-400 font-bold border-2 border-dashed rounded-3xl">
        Résultats non disponibles pour le moment.
      </div>
    );
  }

  const winners = results.slice(0, renderNombreGagnant());
  const rest = results.slice(renderNombreGagnant());

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Sous-tabs optimisés pour mobile (flex-wrap et text-sm) */}
      <div className="w-full flex justify-center">
        <div className="flex flex-row items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2 max-w-full px-3 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab("winners")}
            className={`flex items-center gap-2 px-3 md:px-8 py-1.5 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-all border-2 ${
              activeSubTab === "winners"
                ? "bg-orange-700 text-white border-orange-700 shadow-md transform scale-105"
                : "bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            <Trophy
              size={18}
              className={
                activeSubTab === "winners" ? "text-white" : "text-orange-600"
              }
            />
            Les gagnants ({limit && limit})
          </button>

          <button
            onClick={() => setActiveSubTab("rest")}
            className={`flex items-center gap-2 px-3 md:px-8 py-1.5 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-all border-2 ${
              activeSubTab === "rest"
                ? "bg-orange-700 text-white border-orange-700 shadow-md transform scale-105"
                : "bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            <ListOrdered
              size={18}
              className={
                activeSubTab === "rest" ? "text-white" : "text-orange-600"
              }
            />
            Reste du classement
          </button>
        </div>
      </div>

      {/* etre connecte pour voir les resultats */}
      {!currentUser && (
        <div className="p-10 bg-orange-50 rounded-2xl text-center border-2 border-dashed border-orange-200">
          <Lock className="mx-auto mb-3 text-orange-600" size={32} />
          <p className="font-bold text-black mb-6">
            Connectez-vous pour voir les résultats.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-orange-700 text-white rounded-full font-bold text-sm hover:bg-orange-800 transition-colors w-full sm:w-auto"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register-talent"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}

      {/* Message pour challenge privé */}
      {challenge?.portee?.portee == "privee" && currentUser && (
        <p className="text-center text-[12px] md:text-xs font-bold italic px-4">
          Note : Ce challenge est privé. Les projets ne sont visibles que par
          les administrateurs. Les talents ne voient que le classement par
          équipe.
        </p>
      )}

      {/* Grille des résultats responsive : 1 col sur mobile, 2 sur tablette, 3 sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-700" size={40} />
          </div>
        ) : (
          (activeSubTab === "winners" ? winners : rest).map((p: any, idx) => {
            const isPrivate = challenge?.portee?.portee == "privee";

            if (isPrivate && !isOwner) {
              return (
                <PrivateResultCard
                  key={p.id}
                  project={p}
                  rank={p.rang}
                  challenge={challenge}
                />
              );
            }

            return (
              <ProjectCardResult
                key={p.id}
                project={p}
                challenge={challenge}
                totalPosts={results?.length}
                rank={p.rang}
              />
            );
          })
        )}
      </div>

      {/* Message vide */}
      {!loading &&
        currentUser &&
        (activeSubTab === "winners" ? winners : rest)?.length == 0 && (
          <p className="text-center text-gray-500 py-10 text-sm md:text-base">
            Aucun projet trouvé dans cette catégorie.
          </p>
        )}
    </div>
  );
}
