"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical,
  Trash2,
  Flag,
  MessageCircle,
  Maximize2,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  UserRound,
  Copy,
  Share2,
  ThumbsUp,
  AlertTriangle,
  Loader2,
  Facebook,
  Mail,
  Phone,
  ExternalLink,
  Check,
  Info,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";

/* ================= TYPES & HELPERS ================= */
interface Likeur {
  id: number | string;
  [key: string]: any;
}

const truncate = (str: string, n: number) => {
  if (!str) return "";
  return str.length > n ? str.substr(0, n) + "..." : str;
};

/* ================= COMPOSANTS AUXILIAIRES ================= */

function ContactModal({ isOpen, onClose, user }: any) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">
            Contact
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-300"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-6">
          <div
            onClick={() => {
              router.push(`/profil-talent/${user?.id}`);
              onClose();
            }}
            className="group flex items-center gap-4 p-4 bg-slate-50 rounded-[2rem] border border-transparent hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <Image
                src={apifile + "/" + user?.pp}
                width={64}
                height={64}
                alt="pp"
                className="rounded-full aspect-square object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full border-2 border-white">
                <ExternalLink size={12} />
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                {user?.talent?.nom || user?.name}
              </p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {user?.talent?.profession?.length > 25
                  ? user?.talent?.profession?.substring(0, 25) + "..."
                  : user?.talent?.profession || "Talent"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative group">
              <a
                href={`mailto:${user?.email}`}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Mail size={22} />
                </div>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    E-mail
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {user?.email}
                  </p>
                </div>
              </a>
              <button
                onClick={() => handleCopy(user?.email, "Email")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {copied === "Email" ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>

            <div className="relative group">
              <a
                href={`tel:${user?.telephone}`}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
              >
                <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <Phone size={22} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Téléphone
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {user?.telephone || "Non renseigné"}
                  </p>
                </div>
              </a>
              {user?.telephone && (
                <button
                  onClick={() => handleCopy(user?.telephone, "Téléphone")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {copied === "Téléphone" ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium">
          Cliquez sur un champ pour contacter directement le talent
        </p>
      </motion.div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, loading }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center border"
      >
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-black text-xl text-gray-900 mb-2">
          Supprimer le post ?
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Cette action est irréversible.
        </p>
        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Supprimer"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ShareModal({
  isOpen,
  onClose,
  onShareSuccess,
  postId,
  challengeId,
}: any) {
  const [customMessage, setCustomMessage] = useState("");
  // On stocke le type en cours de chargement ("whatsapp", "facebook" ou null)
  const [loadingType, setLoadingType] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/challenge/${challengeId}/reel?project=${postId}`
      : "";

  const finalMessage = customMessage
    ? `${customMessage}\n\n${shareUrl}`
    : shareUrl;

  const handleShareAction = async (type: "whatsapp" | "facebook" | "copy") => {
    if (type === "copy") {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié !");
      return;
    }

    try {
      setLoadingType(type);

      // On attend l'API (pour le compteur de points)
      await onShareSuccess();

      if (type === "whatsapp") {
        // WhatsApp accepte le texte + l'URL
        window.open(
          `https://wa.me/?text=${encodeURIComponent(finalMessage)}`,
          "_blank",
        );
      } else if (type === "facebook") {
        // Facebook ignore le texte "custom", il ne prend que l'URL 'u'
        // On s'assure que l'URL est bien encodée
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
      }

      onClose();
    } catch (error) {
      toast.error("Erreur lors du partage");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border relative overflow-hidden"
      >
        {/* Overlay de blocage global pendant le chargement */}
        {loadingType && (
          <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center cursor-wait" />
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-xl text-gray-900">Partager</h3>
          <button
            onClick={onClose}
            disabled={!!loadingType}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
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
            disabled={!!loadingType}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* BOUTON WHATSAPP */}
          <button
            onClick={() => handleShareAction("whatsapp")}
            disabled={!!loadingType}
            className="flex flex-col items-center gap-2 group disabled:opacity-70"
          >
            <div className="p-4 bg-[#25D366] text-white rounded-2xl w-full flex justify-center shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
              {loadingType === "whatsapp" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <MessageCircle fill="currentColor" />
              )}
            </div>
            <span className="text-[10px] font-black text-gray-600">
              WhatsApp
            </span>
          </button>

          {/* BOUTON FACEBOOK */}
          <button
            onClick={() => handleShareAction("facebook")}
            disabled={!!loadingType}
            className="flex flex-col items-center gap-2 group disabled:opacity-70"
          >
            <div className="p-4 bg-[#1877F2] text-white rounded-2xl w-full flex justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              {loadingType === "facebook" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Facebook fill="currentColor" />
              )}
            </div>
            <span className="text-[10px] font-black text-gray-600">
              Facebook
            </span>
          </button>

          {/* BOUTON LIEN */}
          <button
            onClick={() => handleShareAction("copy")}
            disabled={!!loadingType}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="p-4 bg-gray-800 text-white rounded-2xl w-full flex justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
              <Copy />
            </div>
            <span className="text-[10px] font-black text-gray-600">Lien</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const limit = 150;
  if (!text) return null;
  return (
    <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
      {open || text.length <= limit ? text : text.slice(0, limit) + "..."}
      {text.length > limit && (
        <button
          onClick={() => setOpen(!open)}
          className="ml-1 text-orange-600 font-bold hover:underline lowercase"
        >
          {open ? "voir moins" : "voir plus"}
        </button>
      )}
    </div>
  );
}

import {
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Eye,
  EyeOff,
  Download,
  FileSearch,
} from "lucide-react";
import { formatKMMD } from "@/app/utils/formatters";
import ScoreDetailModal from "../modals/ScoreDetailModal";
import EditProjectModal from "../modals/EditProjectModal";

// --- Sous-composants ---
function ExpandableText({
  text,
  limit = 250,
}: {
  text: string;
  limit?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  // Correction ici : Forçage de la taille à 15px comme demandé
  if (text.length <= limit)
    return <p className="text-gray-700 text-[15px] leading-relaxed">{text}</p>;

  return (
    <div className="text-gray-700 text-[15px] leading-relaxed">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-orange-700 font-bold hover:underline focus:outline-none text-xs md:text-sm"
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      </p>
    </div>
  );
}

function FileRenderer({
  value,
  type,
  label,
}: {
  value: string;
  type: string;
  label: string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Arrêter la vidéo si elle sort de l'écran (Scroll)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.1 }, // S'active dès que la vidéo est presque hors vue
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // 2. Empêcher plusieurs lectures simultanées
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((vid) => {
      if (vid !== e.currentTarget) {
        vid.pause();
      }
    });
  };

  if (!value) return null;

  const fullUrl = value.startsWith("http") ? value : `${apifile}/${value}`;

  const isImage =
    value.match(/\.(jpg|jpeg|png|webp|gif)$/i) || type === "image";
  const isVideo = value.match(/\.(mp4|mov|webm)$/i) || type === "video";
  const isPDF = /\.pdf$/i.test(value);
  const isDoc = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(value);
  const isPreviewable = isPDF || isDoc;

  if (["text", "textarea", "option", "select"].includes(type)) {
    return <ExpandableText text={value} />;
  }

  if (isVideo) {
    return (
      <div className="mb-4">
        <video
          ref={videoRef}
          controls
          onPlay={handlePlay}
          controlsList="nodownload" // Enlève le menu téléchargement
          onContextMenu={(e) => e.preventDefault()} // Bloque le clic droit
          className="rounded-2xl w-full h-[185px] aspect-video bg-black shadow-lg object-contain border border-slate-100"
        >
          <source src={fullUrl} />
        </video>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="mb-4">
        <img
          src={fullUrl}
          className="rounded-2xl w-full h-[190px] object-cover border border-slate-100 bg-white shadow-sm"
          alt={label}
        />
      </div>
    );
  }

  if (isPreviewable) {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              {isPDF ? <FileText size={14} /> : <File size={14} />}
            </div>
            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px] relative -left-1">
              Aperçu Document
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-md transition-all flex items-center gap-1"
              title="Voir en grand"
            >
              <Maximize2 size={16} />
              <span className="text-[10px] font-bold uppercase">
                Plein écran
              </span>
            </button>
            <a
              href={fullUrl}
              download
              className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-md"
            >
              <Download size={16} />
            </a>
          </div>
        </div>

        <div className="relative w-full h-[380px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
          <iframe
            src={
              isPDF
                ? `${fullUrl}#toolbar=0`
                : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
            }
            className="w-full h-full border-none"
            title={label}
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 pointer-events-none transition-all" />
        </div>

        <AnimatePresence>
          {isFullscreen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFullscreen(false)}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full h-full bg-white md:rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-bold text-sm text-slate-700">
                    {label}
                  </span>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <iframe
                  src={
                    isPDF
                      ? fullUrl
                      : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
                  }
                  className="w-full flex-1 border-none"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
          <File size={18} />
        </div>
        <span className="text-xs font-bold text-slate-600 truncate">
          {label}
        </span>
      </div>
      <a
        href={fullUrl}
        download
        className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all"
      >
        <Download size={14} /> Télécharger
      </a>
    </div>
  );
}

/* ================= COMPOSANT PRINCIPAL ================= */

export default function ProjectCard({ project, challenge }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const [likes, setLikes] = useState<number>(project?.like || 0);
  const [shares, setShares] = useState<number>(project?.partage || 0);
  const [score, setScore] = useState<number>(project?.score || 0);
  const [likeurs, setLikeurs] = useState<Likeur[]>(project?.likeurs || []);

  const [showScoreDetail, setShowScoreDetail] = useState(false);

  // mise a jour du projet sur le frontend
  const [currentProject, setCurrentProject] = useState(project);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const handleProjectUpdated = (updatedPost: any) => {
    setCurrentProject((prev: any) => ({
      ...prev,
      responses: updatedPost.responses,
    }));
    setShowEditModal(false);
    toast.success("Projet mis à jour avec succès !");
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const idchallenge = params.id;

  const hasLiked =
    currentUser && likeurs.some((l: any) => l.id == currentUser?.id);

  // affichage des 3 bouton de dropdown
  const shouldShowDropdownButton = () => {
    const isAuthorOrOwner =
      currentUser?.id == project?.user_id ||
      currentUser?.id == challenge?.user_id;
    if (!isAuthorOrOwner) return false;
    const now = new Date();
    const dateFin = new Date(challenge?.datefininscription);
    // Le créateur du challenge garde toujours accès, même après la date de fin (cohérent avec destroy())
    if (currentUser?.id == challenge?.user_id) return true;
    return now < dateFin;
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) setCurrentUser(JSON.parse(storedAuth).user);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!project || isRemoved) return null;

  const isChallengeOwner = currentUser?.id === challenge?.user_id;
  const isAuthor = currentUser?.id == project?.user_id;

  const apiRequest = async (
    endpoint: string,
    method: string = "GET",
    body?: any,
    keepalive: boolean = false, // Ajoute ce paramètre
  ) => {
    const storedAuth = localStorage.getItem("auth");
    const token = storedAuth ? JSON.parse(storedAuth).token : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      keepalive, // <--- Crucial pour les partages
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
  };

  const handleLike = async () => {
    if (!currentUser) return toast.error("Connectez-vous pour voter");

    const prevLikes = likes;
    const prevLikeurs = [...likeurs];

    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setLikeurs((prev) => prev.filter((l) => l.id !== currentUser.id));
    } else {
      setLikes((prev) => prev + 1);
      setLikeurs((prev) => [...prev, { id: currentUser.id }]);
    }

    try {
      const data = await apiRequest(`/challenge/post/like/${project.id}`);
      if (data.statut == 200) {
        setLikes(data.likes);
        setScore(data.score);
        toast.success(data?.message);
      } else {
        setLikes(prevLikes);
        setLikeurs(prevLikeurs);
        toast.error(data.message);
      }
    } catch (e) {
      setLikes(prevLikes);
      setLikeurs(prevLikeurs);
      toast.error("Erreur de connexion");
    }
  };

  // Cette fonction sera appelée par la modale via la prop onShareSuccess
  const handleShareSuccess = async () => {
    try {
      // On force keepalive: true pour que l'appel survive à la redirection vers WhatsApp/FB
      const data = await apiRequest(
        `/challenge/post/partage/${project.id}`,
        "GET",
        null,
        true,
      );

      if (data.statut == 200) {
        setShares(data.partages);
        setScore(data.score);
      }
    } catch (e) {
      console.error("Erreur partage:", e);
    }
  };

  // Le bouton de la carte ouvre simplement la modale
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleReport = async () => {
    if (!currentUser) return toast.error("Connectez-vous pour signaler");
    setOpenMenu(false);
    toast.loading("Signalement en cours...", { duration: 2000 });
    try {
      const data = await apiRequest(
        `/challenge/post/signaler/${project.id}`,
        "POST",
      );
      toast.dismiss();
      if (data.statut == 200) toast.success(data.message);
      else toast.error(data.message);
    } catch (e) {
      toast.error("Erreur serveur");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const data = await apiRequest(`/challenge/post/delete/${project.id}`);
      if (data.statut === 200) {
        toast.success("Post supprimé");
        setIsRemoved(true);
      } else {
        toast.error(data?.message || "Erreur");
      }
    } catch (e) {
      toast.error("Erreur");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateToReel = () => {
    const query = new URLSearchParams({
      project: project?.id?.toString() || "",
      // titre: challenge?.title || "Challenge",
      // typeevaluation: challenge?.typeevaluation?.type || "vote",
      // resultatdisponible: challenge?.resultatdisponible?.toString() || "0"
    }).toString();
    router.push(`/challenge/${idchallenge}/reel?${query}`);
  };

  const responses = currentProject?.responses || [];

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border w-full max-w-xl mx-auto flex flex-col mb-6 overflow-hidden transition-all">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 pt-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() =>
            router.push(`/profil-talent/${currentProject?.user?.id}`)
          }
        >
          <Image
            src={
              currentProject?.user?.pp
                ? apifile + "/" + currentProject?.user?.pp
                : "../../assets/images/pp2.png"
            }
            width={40}
            height={40}
            alt="avatar"
            className="rounded-full object-cover aspect-square border-2 border-gray-100"
          />
          <div>
            <p className="font-bold text-gray-900 leading-tight text-sm hover:text-orange-600 transition-colors first-letter:uppercase">
              {truncate(
                currentProject?.user?.talent?.nom ||
                  currentProject?.user?.name ||
                  "Talent",
                20,
              )}
            </p>
            <p className="text-[11px] text-gray-500 font-medium first-letter:uppercase">
              {truncate(
                currentProject?.user?.talent?.profession || "Participant",
                20,
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          {isChallengeOwner && (
            <button
              onClick={() => setShowContactModal(true)}
              className="p-2 flex flex-row justify-center items-center gap-x-1 text-orange-700 hover:bg-orange-50 rounded-full"
            >
              <Phone size={17} />
              Contacter
            </button>
          )}
          {shouldShowDropdownButton() && (
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          )}
          <AnimatePresence>
            {openMenu && shouldShowDropdownButton() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-12 w-48 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                {(isChallengeOwner || isAuthor) && (
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                  >
                    <Pencil size={18} /> Modifier mon post
                  </button>
                )}
                {(isChallengeOwner || isAuthor) && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} /> Supprimer le post
                  </button>
                )}
                {!isAuthor && (
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <Flag size={18} /> Signaler
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className={`px-4 mt-2 space-y-6 overflow-y-auto ${showAllFields ? "max-h-[220px]" : "max-h-[220px]"} scrollbar-thin pb-2`}
      >
        {/* RANG / SCORE - Conditionné par le type d'évaluation */}
        {challenge?.typeevaluation?.type != "jury" && (
          <div className="px-4">
            {/* Grille de badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              {/* Badge Rang */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm whitespace-nowrap">
                <div className="bg-yellow-50 p-1.5 rounded-lg">
                  <Trophy size={14} className="text-yellow-600 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-medium leading-none mb-0.5">
                    Rang provisoire
                  </span>
                  <span className="text-gray-900 leading-none text-[12px]">
                    {currentProject?.rang || "-"}
                  </span>
                </div>
              </div>

              {/* Badge Score */}

              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm whitespace-nowrap">
                <div className="bg-orange-50 p-1.5 rounded-lg">
                  <Flame size={14} className="text-orange-600 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-medium leading-none mb-0.5">
                    Score provisoire
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* ✅ Score cliquable — ouvre aussi le modal */}
                    <span
                      onClick={() => setShowScoreDetail(true)}
                      className="text-gray-900 leading-none text-[12px] font-black cursor-pointer hover:text-orange-600 transition-colors"
                    >
                      {formatKMMD(score, false)}
                    </span>

                    {/* ✅ Bouton "Plus de détails" — remplace l'icône Info */}
                    <button
                      onClick={() => setShowScoreDetail(true)}
                      className="px-2 xl:px-1 py-0.5 bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-bold rounded-full transition-all hover:scale-105 whitespace-nowrap"
                    >
                      Plus de détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {responses.map((r: any, idx: number) => (
          <div
            key={r?.id}
            className={`${!showAllFields && idx > 1 ? "hidden" : "block"}`}
          >
            <p className="font-bold text-sm text-gray-950 mb-1.5 first-letter:uppercase">
              {r?.challenge_field?.label}
            </p>
            {r?.challenge_field?.type === "text" ||
            r?.challenge_field?.type === "option" ? (
              <ReadMore text={r?.value} />
            ) : (
              <FileRenderer
                value={r?.value}
                type={r?.challenge_field?.type}
                label={r?.challenge_field?.label}
              />
            )}
          </div>
        ))}
      </div>

      {/* VOIR PLUS */}
      {responses.length > 2 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="text-orange-600 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 py-3 border-t border-gray-50 hover:bg-orange-50/30 border-t border-gray-200"
        >
          {showAllFields ? (
            <>
              <ChevronUp size={16} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Voir les {responses.length - 2} autres
              champs
            </>
          )}
        </button>
      )}

      {/* FOOTER RESPONSIVE */}
      <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between bg-white border-t border-gray-400 md:gap-x-3">
        <button
          onClick={handleLike}
          className={`w-full sm:w-auto flex items-center justify-center gap-3 px-5 md:px-3 py-1 rounded-xl transition-all active:scale-95
          ${
            hasLiked
              ? "bg-orange-700 border-orange-700 text-white shadow-orange-700/20"
              : "bg-gray-200 border-gray-200 text-gray-900"
          }`}
        >
          <ThumbsUp size={18} className={hasLiked ? "fill-white" : ""} />
          <div className="flex flex-col items-center leading-tight">
            <span className="text-sm font-black">{likes}</span>
            <span className="text-[9px] font-bold whitespace-nowrap">
              Vote(s)
            </span>
          </div>
        </button>

        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 md:gap-x-3 pt-4 sm:pt-0">
          <button
            onClick={handleNavigateToReel}
            className="flex flex-col items-center group bg-gray-200 px-6 md:px-2 py-1 rounded-xl"
          >
            <span className="text-sm font-black text-gray-900">
              {currentProject?.commentaires_count || 0}
            </span>
            <div className="flex items-center gap-1">
              <MessageCircle
                size={14}
                className="text-gray-400 group-hover:text-orange-600"
              />
              <span className="text-[9px] font-bold">Avis</span>
            </div>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center group bg-gray-200 px-6 md:px-2 py-1 rounded-xl"
          >
            <span className="text-sm font-black text-gray-900">{shares}</span>
            <div className="flex items-center gap-1">
              <Share2
                size={14}
                className="text-gray-400 group-hover:text-orange-600"
              />
              <span className="text-[9px] font-bold ">Partage(s)</span>
            </div>
          </button>

          <button
            onClick={handleNavigateToReel}
            className="p-2.5 bg-orange-700 cursor-pointer hover:bg-orange-600 hover:scale-105 text-white rounded-xl active:scale-95 shadow-md px-4 md:px-2.5"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <ScoreDetailModal
        postId={currentProject?.id}
        isOpen={showScoreDetail}
        onClose={() => setShowScoreDetail(false)}
        user={currentProject?.user}
        isNoteFinale={false} // À mettre à true si tu utilises une variable notefinale
        data={{
          value: score,
          votes: likes,
          shares: shares,
          comments: currentProject?.commentaires_count || 0,
        }}
      />

      <DeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShareSuccess={handleShareSuccess}
        postId={currentProject?.id}
        challengeId={challenge?.id}
      />
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={currentProject?.user}
      />

      {/* edit post  */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={handleProjectUpdated}
        project={currentProject}
        challenge={challenge}
      />
    </div>
  );
}
