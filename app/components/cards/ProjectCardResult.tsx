"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
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
  Mail,
  Phone,
  FileText,
  FileSpreadsheet,
  File,
  PencilLine,
  Loader2,
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Presentation,
  Download,
  EyeOff,
  FileSearch,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { API_BASE_URL } from "@/app/lib/api";
import { formatKMMD } from "@/app/utils/formatters";
import ScoreDetailModal from "../modals/ScoreDetailModal";

/* ================= COMPOSANTS AUXILIAIRES ================= */

// Modal de confirmation de suppression
function DeleteModal({ isOpen, onClose, onConfirm, loading }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-black text-xl text-gray-900 mb-2">
            Supprimer le post ?
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Cette action est irréversible et supprimera définitivement cette
            participation.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Supprimer"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScoreModal({
  isOpen,
  onClose,
  postId,
  currentNote,
  onUpdate,
  user,
  onUpdateCommentJury,
  currentCommentJury,
}: any) {
  const [note, setNote] = useState(currentNote || "");
  const [comment, setComment] = useState(currentCommentJury || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!note || isNaN(note)) {
      toast.error("Veuillez saisir une note valide");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Modification de la note...");

    try {
      const storedAuth = localStorage.getItem("auth");
      const token = storedAuth ? JSON.parse(storedAuth).token : null;
      const apiUrl = API_BASE_URL;

      const response = await fetch(`${apiUrl}/post/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          note: note,
          commentairejury: comment,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        throw new Error("Le serveur a renvoyé une erreur");
      }

      const data = await response.json();

      if (data.statut === 200) {
        toast.success(data.message || "Note Modifiée !", { id: loadingToast });
        onUpdate(data.moyenne_finale);
        onUpdateCommentJury(data.votre_commentaire);
        onClose();
      } else {
        toast.error(data.message || "Erreur", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Erreur de connexion", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={apifile + "/" + user?.pp}
              width={35}
              height={35}
              alt="pp"
              className="rounded-full aspect-square object-cover border"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate uppercase leading-tight line-clamp-1">
                {user?.talent?.nom?.length > 20
                  ? user?.talent?.nom?.slice(0, 20) + "..."
                  : user?.talent?.nom || "Participant"}
              </p>
              <p className="text-[10px] text-gray-500 font-medium truncate">
                {user?.talent?.profession?.length > 30
                  ? user?.talent?.profession?.slice(0, 30) + "..."
                  : user?.talent?.profession || "Participant"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <h3 className="font-black text-lg text-gray-900 tracking-tight">
            Modifier la note
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Note du jury
              </label>
              <input
                type="number"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full mt-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none font-black text-2xl"
                placeholder="00"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mt-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none text-sm h-28 resize-none"
                placeholder="Avis..."
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "VALIDER LA NOTE"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-md"
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
        {/* Header */}
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
          {/* Profile Card Action */}
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
            {/* Email Field */}
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

            {/* Phone Field */}
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

        {/* Footer Info */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium">
          Cliquez sur un champ pour contacter directement le talent
        </p>
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
           {" "}
      {text.length > limit && (
        <button
          onClick={() => setOpen(!open)}
          className="ml-1 text-orange-600 font-bold hover:underline lowercase"
        >
                    {open ? "voir moins" : "voir plus"}       {" "}
        </button>
      )}
         {" "}
    </div>
  );
}

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

  if (type === "text" || type === "textarea" || type === "option") {
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

export default function ProjectCardResult({ project, challenge }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [localNote, setLocalNote] = useState(
    challenge?.typeevaluation?.type == "vote"
      ? project?.score
      : project?.notefinale,
  );
  const [localCommentJury, setLocalCommentJury] = useState(
    project?.commentairejury[0]?.commentairejury
      ? project?.commentairejury[0]?.commentairejury
      : "",
  );

  // Déterminer le type de valeur à afficher
  const isVoteType =
    challenge?.typeevaluation?.type === "vote" ||
    challenge?.resultatdisponible === 0;
  const displayValue = isVoteType ? project?.score : project?.notefinale;

  const labelBadge = isVoteType ? "Score final" : "Note finale";
  const commentJury = project?.commentairejury?.[0]?.commentairejury || "";

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const router = useRouter();
  const params = useParams();
  const idchallenge = params.id;

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

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!project || isRemoved) return null;

  const isOwner = currentUser?.id == challenge?.user_id;

  const shouldShowEditButton = () => {
    if (!isOwner) return false;
    const isVoteType = challenge?.typeevaluation?.type == "vote";
    if (isVoteType) {
      const now = new Date();
      const dateFin = new Date(challenge?.datefin);
      return now < dateFin;
    } else {
      return challenge?.resultatdisponible == 0;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const deletingToast = toast.loading("Suppression en cours...");

    try {
      const storedAuth = localStorage.getItem("auth");
      const token = storedAuth ? JSON.parse(storedAuth).token : null;
      const apiUrl = API_BASE_URL;

      const response = await fetch(
        `${apiUrl}/challenge/post/delete/${project.id}`,
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
        toast.success("Post supprimé avec succès", { id: deletingToast });
        setIsRemoved(true); // Cache le composant du frontend
        setShowDeleteConfirm(false);
      } else {
        toast.error(data.message || "Impossible de supprimer le post", {
          id: deletingToast,
        });
      }
    } catch (error) {
      toast.error("Erreur de connexion lors de la suppression", {
        id: deletingToast,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateNote = (newMoyenne: number) => {
    setLocalNote(newMoyenne);
  };
  const handleUpdateCommentJury = (newComment: string) => {
    setLocalCommentJury(newComment);
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

  const responses = project?.responses || [];

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border w-full max-w-xl mx-auto flex flex-col mb-6 overflow-hidden transition-all">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push(`/profil-talent/${project?.user?.id}`)}
        >
          <Image
            src={
              project?.user?.pp
                ? apifile + "/" + project?.user?.pp
                : "../../assets/images/pp2.png"
            }
            width={40}
            height={40}
            alt="avatar"
            className="rounded-full object-cover aspect-square border-2 border-gray-100"
          />
          <div>
            <p className="font-bold text-gray-900 leading-tight text-sm hover:text-orange-600 transition-colors first-letter:uppercase">
              {(project?.user?.talent?.nom?.length > 18
                ? project?.user?.talent?.nom.substring(0, 18) + "..."
                : project?.user?.talent?.nom) || "Talent"}
            </p>
            <p className="text-[11px] text-gray-500 font-medium first-letter:uppercase">
              {(project?.user?.talent?.profession?.length > 25
                ? project?.user?.talent?.profession.substring(0, 25) + "..."
                : project?.user?.talent?.profession) || "Participant"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          {isOwner && (
            <button
              onClick={() => setShowContact(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <UserRound size={19} />
            </button>
          )}

          {/* Bouton 3 points (Dropdown) uniquement pour le propriétaire */}
          {isOwner && (
            <>
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${openMenu ? "text-orange-600 bg-gray-100" : "text-gray-400"}`}
              >
                <MoreVertical size={20} />
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                      Supprimer le post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* RANG / SCORE */}
      <div className="px-4">
        {/* Grille de badges pour les résultats finaux */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          {/* Badge Rang Final */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm whitespace-nowrap">
            <div className="bg-yellow-50 p-1.5 rounded-lg shrink-0">
              <Trophy size={14} className="text-yellow-600" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] text-gray-500 font-medium leading-none mb-1">
                Rang final
              </span>
              <span className="text-gray-900 leading-none truncate text-[12px]">
                {project?.rang || "-"}
              </span>
            </div>
          </div>

          {/* Badge Note Finale + Edition */}
          <div className="flex items-center justify-between bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 p-1.5 rounded-lg shrink-0">
                <Flame size={14} className="text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-medium leading-none mb-1">
                  {challenge.typeevaluation["type"] == "vote"
                    ? "Score"
                    : "Note"}{" "}
                  finale
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 leading-none text-[12px] font-black">
                    {formatKMMD(
                      localNote || 0,
                      challenge.typeevaluation["type"] !== "vote",
                    )}
                    <span className="text-[9px] ml-0.5">
                      {challenge.typeevaluation["type"] == "vote" ? "" : "/20"}
                    </span>
                  </span>
                  {/* Bouton Info pour voir le détail */}
                  <button
                    onClick={() => setShowScoreDetail(true)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Info size={13} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {shouldShowEditButton() && (
              <button
                onClick={() => setShowEditScore(true)}
                className="ml-2 p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border-l border-gray-50 pl-2"
              >
                <PencilLine size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ZONE DE CONTENU */}
      <div className="px-4 mt-5 space-y-6 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-gray-200 transition-all duration-300 pb-2">
        {responses.map((r: any, idx: number) => (
          <div
            key={r?.id}
            className={`group ${!showAllFields && idx > 1 ? "hidden" : "block"}`}
          >
            <p className="font-bold text-sm text-gray-950 mb-1.5 first-letter:uppercase">
              {r?.challenge_field?.label || "Information"}
            </p>
            <div className="text-gray-800">
              {r?.challenge_field?.type == "text" ||
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
          </div>
        ))}
      </div>

      {/* VOIR PLUS */}
      {responses.length > 2 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="flex-shrink-0 text-orange-600 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 py-3 border-t border-gray-50 hover:bg-orange-50/30 transition-all first-letter:uppercase"
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

      {/* FOOTER */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50/50 border-t flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Votes */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-black text-gray-900 leading-none">
              {project?.like}
            </span>
            <span className="text-[9px] font-bold text-gray-400 first-letter:uppercase tracking-tight mt-0.5">
              Vote(s)
            </span>
          </div>

          {/* Avis / Commentaires */}
          <button
            onClick={handleNavigateToReel}
            className="flex items-center gap-1 text-gray-600 hover:text-orange-700 transition group"
          >
            <MessageCircle
              size={19}
              className="text-gray-400 group-hover:text-orange-600"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black leading-none text-gray-900">
                {project?.commentaires_count}
              </span>
              <span className="text-[9px] font-bold text-gray-400 first-letter:uppercase tracking-tight mt-0.5">
                Avis
              </span>
            </div>
          </button>

          {/* Partages - AJOUTÉ ICI */}
          <button className="flex items-center gap-1 text-gray-600 hover:text-orange-700 transition group">
            <Share2
              size={19}
              className="text-gray-400 group-hover:text-orange-600"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black leading-none text-gray-900">
                {project?.partage}
              </span>
              <span className="text-[9px] font-bold text-gray-400 first-letter:uppercase tracking-tight mt-0.5">
                Partage(s)
              </span>
            </div>
          </button>
        </div>

        {/* Bouton Voir / Agrandir */}
        <button
          onClick={handleNavigateToReel}
          className="p-3 bg-orange-700 cursor-pointer hover:bg-orange-600 hover:scale-105 text-white rounded-2xl shadow-lg shadow-orange-700/20 active:scale-95 transition-all flex items-center justify-center"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showContact && (
          <ContactModal
            isOpen={showContact}
            onClose={() => setShowContact(false)}
            user={project?.user}
          />
        )}
        {showEditScore && (
          <ScoreModal
            isOpen={showEditScore}
            onClose={() => setShowEditScore(false)}
            postId={project?.id}
            currentNote={localNote}
            onUpdate={handleUpdateNote}
            onUpdateCommentJury={handleUpdateCommentJury}
            currentCommentJury={localCommentJury}
            user={project?.user}
          />
        )}

        <ScoreDetailModal
          isOpen={showScoreDetail}
          onClose={() => setShowScoreDetail(false)}
          isNoteFinale={project.notefinale ? true : false}
          commentJury={commentJury}
          data={{
            value: displayValue || 0,
            votes: project?.like || 0, // Vérifie si c'est 'vote' ou 'like' dans cet objet
            shares: project?.partage || 0,
            comments: project?.commentaires_count || 0,
          }}
        />

        {showDeleteConfirm && (
          <DeleteModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            loading={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
