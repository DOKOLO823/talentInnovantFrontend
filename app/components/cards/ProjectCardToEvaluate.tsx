"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical,
  Trash2,
  Flag,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  UserRound,
  Copy,
  ExternalLink,
  Check,
  Eye,
  Loader2,
  FileText,
  FileSpreadsheet,
  File,
  AlertTriangle,
  Mail,
  Phone,
  Download,
  EyeOff,
  FileSearch,
  Presentation,
  Maximize2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { API_BASE_URL } from "@/app/lib/api";
import { formatKMMD } from "@/app/utils/formatters";
import ScoreDetailModal from "../modals/ScoreDetailModal";

/* ================= HELPERS ================= */
const truncate = (str: string, n: number) => {
  if (!str) return "";
  return str.length > n ? str.substr(0, n) + "..." : str;
};

/* ================= COMPOSANTS AUXILIAIRES ================= */

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
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            <Image
              src={apifile + "/" + user?.pp}
              width={64}
              height={64}
              alt="pp"
              className="rounded-full aspect-square object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-500"
            />
            <div className="overflow-hidden">
              <p className="font-black text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                {user?.talent?.nom || user?.name}
              </p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {user?.talent?.profession || "Talent"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="relative group">
              <a
                href={`mailto:${user?.email}`}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail size={22} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    E-mail
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {user?.email}
                  </p>
                </div>
              </a>
              <button
                onClick={() => handleCopy(user?.email, "Email")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600"
              >
                {copied === "Email" ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>
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

export default function ProjectCardToEvaluate({
  project,
  challenge,
  onEvaluate,
}: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [showScoreDetail, setShowScoreDetail] = useState(false);

  const dateFin = new Date(challenge?.datefin).getTime();
  const maintenant = new Date().getTime();

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) setCurrentUser(JSON.parse(storedAuth).user);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    const deletingToast = toast.loading("Suppression...");
    try {
      const storedAuth = localStorage.getItem("auth");
      const token = storedAuth ? JSON.parse(storedAuth).token : null;
      const response = await fetch(
        `${API_BASE_URL}/challenge/post/delete/${project.id}`,
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
        toast.success("Supprimé", { id: deletingToast });
        setIsRemoved(true);
        setShowDeleteConfirm(false);
      } else {
        toast.error(data.message || "Erreur", { id: deletingToast });
      }
    } catch (error) {
      toast.error("Erreur de connexion", { id: deletingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const isChallengeOwner = currentUser?.id === challenge?.user_id;
  const responses = project?.responses || [];

  if (isRemoved) return null;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border w-full max-w-xl mx-auto flex flex-col mb-6 overflow-hidden transition-all">
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
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
            <p className="font-bold text-gray-900 leading-tight text-sm hover:text-orange-600 first-letter:uppercase">
              {truncate(
                project?.user?.talent?.nom || project?.user?.name || "Talent",
                20,
              )}
            </p>
            <p className="text-[11px] text-gray-500 font-medium first-letter:uppercase">
              {truncate(project?.user?.talent?.profession || "Participant", 20)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative" ref={dropdownRef}>
          {isChallengeOwner && (
            <button
              onClick={() => setShowContactModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <UserRound size={19} />
            </button>
          )}
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          <AnimatePresence>
            {openMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-12 w-48 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden font-bold text-sm"
              >
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    toast.success("Signalement envoyé");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                >
                  <Flag size={18} /> Signaler
                </button>
                {isChallengeOwner && (
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} /> Supprimer le post
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {challenge?.typeevaluation?.type !== "jury" && (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
              <div className="bg-yellow-50 p-1.5 rounded-lg">
                <Trophy size={14} className="text-yellow-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-medium leading-none">
                  Rang provisoire
                </span>
                <span className="text-gray-900 leading-none text-[12px]">
                  {project?.rang || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
              <div className="bg-orange-50 p-1.5 rounded-lg">
                <Flame size={14} className="text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-medium leading-none mb-0.5">
                  Score provisoire
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 leading-none text-[12px] font-black">
                    {/* isFloat: false car ce sont des points d'interaction */}
                    {formatKMMD(project?.score || 0, false)}
                  </span>
                  <button
                    onClick={() => setShowScoreDetail(true)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Info size={13} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mt-5 space-y-6 overflow-y-auto max-h-[220px] scrollbar-thin pb-2">
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

      {responses.length > 2 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="text-orange-600 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 py-3 border-t border-gray-100 mt-2"
        >
          {showAllFields ? (
            <>
              <ChevronUp size={16} /> VOIR MOINS
            </>
          ) : (
            <>
              <ChevronDown size={16} /> VOIR PLUS ({responses.length - 2})
            </>
          )}
        </button>
      )}

      <div className="px-5 py-4 flex flex-col gap-3 bg-white border-t border-gray-100">
        <button
          onClick={onEvaluate}
          disabled={
            (challenge?.typeevaluation?.type?.toLowerCase() == "hybride" &&
              dateFin > maintenant) ||
            challenge?.typeevaluation?.type?.toLowerCase() == "vote"
          }
          className={`w-full flex items-center justify-center ${(challenge?.typeevaluation?.type?.toLowerCase() == "hybride" && dateFin > maintenant) || challenge?.typeevaluation?.type?.toLowerCase() == "vote" ? "bg-gray-200 text-gray-400" : "bg-orange-700 text-white hover:bg-orange-800"}  gap-2 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95`}
        >
          <Eye size={20} /> Évaluer le projet
        </button>
      </div>

      <ScoreDetailModal
        isOpen={showScoreDetail}
        onClose={() => setShowScoreDetail(false)}
        isNoteFinale={false}
        data={{
          value: project?.score || 0,
          votes: project?.like || 0,
          shares: project?.partage || 0,
          comments: project?.commentaires_count || 0,
        }}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={project?.user}
      />
      <DeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
}
