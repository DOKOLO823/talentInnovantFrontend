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
        setChallenge(response?.data?.challenge);
        setChallengeBestFormat({
          id: response?.data?.challenge.id,
          title: response?.data?.challenge.titre,
          image: response?.data?.challenge.photo
            ? `${apifile}/${response?.data?.challenge.photo}`
            : "/assets/images/innov.jpg",
        });
        setLikeursIds(response.data.likeurs_ids || []);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = currentUser?.id === challenge?.user_id;
  const isJury = currentUser?.id === challenge?.jury_id;
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
        router.push("/home-entreprise/Challenges");
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

        <button
          onClick={() => setShowShareModal(true)}
          className="bg-white border px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-100 transition-all active:scale-95"
        >
          <Share2 size={18} /> Partager
        </button>

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
            <EvaluateProjectsSection challenge={challenge} />
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
              data={challenge?.principe}
            />
          )}
          {activeTab === "criteria" && (
            <ListSection
              title="Critères d'évaluation"
              data={challenge?.critereevaluation}
            />
          )}
          {activeTab === "rewards" && (
            <ListSection title="Récompenses" data={challenge?.recompense} />
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

function EvaluateProjectsSection({ challenge }: any) {
  const [activeSubTab, setActiveSubTab] = useState(
    challenge?.typeevaluation?.type?.toLowerCase() != "vote"
      ? "a_evaluer"
      : "provisoire",
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const dateFin = new Date(challenge?.datefin).getTime();
  const maintenant = new Date().getTime();

  const fetchEvalData = async () => {
    setLoading(true);
    try {
      // Correction de l'endpoint selon l'onglet
      const endpoint =
        activeSubTab === "a_evaluer"
          ? `/challenge/posts/${challenge?.id}`
          : `/posts/listepostsnotes/${challenge?.id}`;

      const res = await apiFetch(endpoint);
      let data = res.top_posts || res.data || [];

      if (activeSubTab === "a_evaluer") {
        const toEvaluate = data
          ?.filter((item: any) => item?.notefinale == null)
          .sort((a: any, b: any) => b?.score - a?.score);
        setProjects(toEvaluate);
      } else {
        const evaluated = data?.filter((item: any) => item?.notefinale != null);
        setProjects(
          evaluated?.sort((a: any, b: any) => b?.notefinale - a?.notefinale),
        );
      }
    } catch (e) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalData();
  }, [activeSubTab, challenge.id]);

  const handlePublishResults = async () => {
    if (!challenge?.id) return;
    setIsPublishing(true);
    const publishToast = toast.loading("Publication des résultats...");

    try {
      const storedAuth = localStorage.getItem("auth");
      const token = storedAuth ? JSON.parse(storedAuth).token : null;

      const response = await fetch(
        `${API_BASE_URL}/challenge/publier-resultats/${challenge?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.statut === 200) {
        toast.success(data.message, { id: publishToast, duration: 6000 });
        // setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.message || "Erreur", { id: publishToast });
      }
    } catch (error) {
      toast.error("Erreur de connexion", { id: publishToast });
    } finally {
      setIsPublishing(false);
    }
  };

  const renderNombreAEvaluer = () => {
    try {
      // 1. Transformer le string en véritable tableau JS
      const data =
        typeof challenge?.nombregagnant === "string"
          ? JSON.parse(challenge.nombregagnant)
          : challenge?.nombregagnant;

      // Vérifier si c'est un tableau valide
      if (!Array.isArray(data) || data?.length === 0) return "";

      return (
        <span className="text-gray-700 text-sm">
          <span>
            Le jury procédera à l'évaluation des{" "}
            <span className="font-bold">{data[0]}</span> premiers projets
            (uniquement) figurant sur cette liste.
          </span>
        </span>
      );
    } catch (e) {
      // En cas d'erreur de parsing ou format inattendu
      return (
        <span className="text-gray-700 text-sm">
          {challenge?.nombregagnant || ""}
        </span>
      );
    }
  };

  // date de debut de notation de projet
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* ONGLETS ET BOUTON PUBLIER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 p-1 bg-gray-200 rounded-xl w-fit">
          {challenge?.typeevaluation?.type != "vote" && (
            <button
              onClick={() => setActiveSubTab("a_evaluer")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === "a_evaluer" ? "bg-white text-orange-700 shadow" : "text-gray-500"}`}
            >
              À évaluer
            </button>
          )}
          <button
            onClick={() => setActiveSubTab("provisoire")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === "provisoire" ? "bg-white text-orange-700 shadow" : "text-gray-500"}`}
          >
            Résultats provisoires
          </button>
        </div>

        {activeSubTab === "provisoire" && (
          <button
            onClick={handlePublishResults}
            disabled={
              isPublishing ||
              challenge?.resultatdisponible == 1 ||
              (dateFin > maintenant &&
                challenge?.typeevaluation?.type?.toLowerCase() == "vote")
            }
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              challenge?.resultatdisponible == 1 ||
              ((challenge?.typeevaluation?.type?.toLowerCase() == "hybride" ||
                challenge?.typeevaluation?.type?.toLowerCase() == "vote") &&
                dateFin > maintenant)
                ? "bg-gray-100 text-gray-400 border border-gray-200"
                : "bg-orange-700 text-white hover:bg-orange-600 shadow-lg shadow-blue-100"
            }`}
          >
            {isPublishing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : challenge?.resultatdisponible == 1 ? (
              <CheckCircle size={16} />
            ) : (
              <Send size={16} />
            )}
            {challenge?.resultatdisponible == 1
              ? "RÉSULTATS DÉJÀ PUBLIÉS"
              : "PUBLIER LES RÉSULTATS"}
          </button>
        )}
      </div>

      {challenge?.typeevaluation?.type?.toLowerCase() == "hybride" &&
        dateFin > maintenant &&
        activeSubTab === "a_evaluer" && (
          <span className=" text-sm">
            {" "}
            NB: Les notations des projets commencent le{" "}
            <span className="font-bold">
              {formatDate(challenge?.datefin)}
            </span>{" "}
            (date de fin des votes de projets){" "}
          </span>
        )}

      {challenge?.typeevaluation?.type?.toLowerCase() == "hybride" &&
        dateFin < maintenant &&
        activeSubTab === "a_evaluer" && (
          <div className=" mt-3"> {renderNombreAEvaluer()} </div>
        )}

      {/* GRILLE DE PROJETS */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-orange-700" size={40} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
          {projects?.length > 0 ? (
            projects?.map((p) =>
              activeSubTab === "a_evaluer" ? (
                <ProjectCardToEvaluate
                  key={p.id}
                  project={p}
                  allProjects={projects}
                  challenge={challenge}
                  // onProjectEvaluated={(id: number) => {
                  //   setProjects(prev => prev.filter(item => item.id !== id));
                  // }}
                  onEvaluate={() => setSelectedProjectId(p.id)}
                />
              ) : (
                <ProjectCardResult
                  key={p.id}
                  project={p}
                  challenge={challenge}
                />
              ),
            )
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-3xl">
              Aucun projet dans cette catégorie.
            </div>
          )}
        </div>
      )}

      {/* MODAL D'ÉVALUATION */}
      {selectedProjectId !== null && activeSubTab === "a_evaluer" && (
        <EvaluateProjectModal
          initialProjectId={selectedProjectId}
          projectsList={projects}
          onClose={() => setSelectedProjectId(null)}
          onProjectEvaluated={(id: number) => {
            // Le filtrage se fait ici
            setProjects((prev) => prev.filter((item) => item.id !== id));
          }}
        />
      )}
    </div>
  );
}

function OverviewSection({ challenge }: any) {
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
          <p className="text-gray-700 leading-relaxed">
            {challenge?.objectif ||
              "Atteindre les meilleurs résultats selon les critères définis."}
          </p>
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
              <ul className="space-y-1">
                {(Array.isArray(challenge?.publiccible)
                  ? challenge?.publiccible
                  : typeof challenge?.publiccible === "string"
                    ? JSON.parse(challenge?.publiccible)
                    : []
                )?.map((item: string, index: number) => (
                  <li
                    key={index}
                    className="text-gray-700 text-sm flex items-center gap-2"
                  >
                    <div className="w-1 h-1 bg-orange-700 rounded-full" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
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
            <p className="text-gray-700 font-bold">{getJuryName()}</p>
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
