"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical,
  Trash2,
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
  File,
  PencilLine,
  Loader2,
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Share2,
  Download,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { API_BASE_URL } from "@/app/lib/api";
import { formatKMMD } from "@/app/utils/formatters";
import ScoreDetailModal from "../modals/ScoreDetailModal";

/* ─── DeleteModal ─── */
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
            Cette action est irréversible.
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

/* ─── ScoreModal (owner — ancien système note globale) ─── */
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
    const t = toast.loading("Modification...");
    try {
      const auth = localStorage.getItem("auth");
      const token = auth ? JSON.parse(auth).token : null;
      const res = await fetch(`${API_BASE_URL}/post/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, note, commentairejury: comment }),
      });
      const data = await res.json();
      if (data.statut === 200) {
        toast.success(data.message || "Note modifiée !", { id: t });
        onUpdate(data.moyenne_finale);
        onUpdateCommentJury(data.votre_commentaire);
        onClose();
      } else {
        toast.error(data.message || "Erreur", { id: t });
      }
    } catch {
      toast.error("Erreur de connexion", { id: t });
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
              <p className="font-bold text-xs truncate uppercase leading-tight">
                {user?.talent?.nom?.slice(0, 20) || "Participant"}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {user?.talent?.profession?.slice(0, 30) || "Participant"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <h3 className="font-black text-lg text-gray-900">Modifier la note</h3>
          <input
            type="number"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            min="0"
            max="20"
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 outline-none font-black text-2xl"
            placeholder="00"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 outline-none text-sm resize-none"
            placeholder="Avis..."
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "VALIDER LA NOTE"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── ContactModal ─── */
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
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-extrabold text-xl text-slate-800">Contact</h3>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div
          onClick={() => {
            router.push(`/profil-talent/${user?.id}`);
            onClose();
          }}
          className="flex items-center gap-4 p-4 bg-slate-50 rounded-[2rem] border border-transparent hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer mb-6"
        >
          <div className="relative">
            <Image
              src={apifile + "/" + user?.pp}
              width={56}
              height={56}
              alt="pp"
              className="rounded-full aspect-square object-cover border-4 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full border-2 border-white">
              <ExternalLink size={12} />
            </div>
          </div>
          <div>
            <p className="font-black text-slate-800">
              {user?.talent?.nom || user?.name}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {user?.talent?.profession || "Talent"}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            {
              href: `mailto:${user?.email}`,
              icon: <Mail size={20} />,
              label: "E-mail",
              value: user?.email,
              color: "bg-blue-50 text-blue-600",
              key: "Email",
            },
            {
              href: `tel:${user?.telephone}`,
              icon: <Phone size={20} />,
              label: "Téléphone",
              value: user?.telephone || "Non renseigné",
              color: "bg-green-50 text-green-600",
              key: "Téléphone",
            },
          ].map((item) => (
            <div key={item.key} className="relative">
              <a
                href={item.href}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all"
              >
                <div className={`p-3 ${item.color} rounded-xl`}>
                  {item.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {item.value}
                  </p>
                </div>
              </a>
              {user?.[item.key === "Email" ? "email" : "telephone"] && (
                <button
                  onClick={() =>
                    handleCopy(
                      user[item.key === "Email" ? "email" : "telephone"],
                      item.key,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600"
                >
                  {copied === item.key ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Sous-composants contenu ─── */
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

function ExpandableText({
  text,
  limit = 250,
}: {
  text: string;
  limit?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= limit)
    return <p className="text-gray-700 text-[15px] leading-relaxed">{text}</p>;
  return (
    <div className="text-gray-700 text-[15px] leading-relaxed">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-orange-700 font-bold hover:underline focus:outline-none text-xs"
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting && videoRef.current) videoRef.current.pause();
        });
      },
      { threshold: 0.1 },
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  if (!value) return null;
  const fullUrl = value.startsWith("http") ? value : `${apifile}/${value}`;
  const isImage =
    value.match(/\.(jpg|jpeg|png|webp|gif)$/i) || type === "image";
  const isVideo = value.match(/\.(mp4|mov|webm)$/i) || type === "video";
  const isPDF = /\.pdf$/i.test(value);
  const isDoc = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(value);
  const isPreviewable = isPDF || isDoc;

  if (["text", "textarea", "option", "select"].includes(type))
    return <ExpandableText text={value} />;

  if (isVideo)
    return (
      <div className="mb-4">
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          onPlay={(e) => {
            document.querySelectorAll("video").forEach((v) => {
              if (v !== e.currentTarget) v.pause();
            });
          }}
          className="rounded-2xl w-full h-[185px] aspect-video bg-black shadow-lg object-contain border border-slate-100"
        >
          <source src={fullUrl} />
        </video>
      </div>
    );

  if (isImage)
    return (
      <div className="mb-4">
        <img
          src={fullUrl}
          className="rounded-2xl w-full h-[190px] object-cover border border-slate-100 bg-white shadow-sm"
          alt={label}
        />
      </div>
    );

  if (isPreviewable)
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              {isPDF ? <FileText size={14} /> : <File size={14} />}
            </div>
            <span className="text-[10px] font-bold text-slate-600">
              Aperçu Document
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-md flex items-center gap-1"
            >
              <Maximize2 size={14} />
              <span className="text-[10px] font-bold uppercase">
                Plein écran
              </span>
            </button>
            <a
              href={fullUrl}
              download
              className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-md"
            >
              <Download size={14} />
            </a>
          </div>
        </div>
        <div className="w-full h-[300px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <iframe
            src={
              isPDF
                ? `${fullUrl}#toolbar=0`
                : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
            }
            className="w-full h-full border-none"
            title={label}
          />
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
                    className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"
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

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — ProjectCardResult
   Props ajoutées : onEditNotes (callback), isJury (boolean)
   ✅ Mise à jour immédiate : localNote + localNotefinale + localRang
   ═══════════════════════════════════════════════════════════════ */
export default function ProjectCardResult({
  project,
  challenge,
  onEditNotes,
  isJury,
}: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // ── État local pour mise à jour immédiate ──
  const isVoteType = challenge?.typeevaluation?.type === "vote";
  const initialNote = isVoteType ? project?.score : project?.notefinale;
  const [localNote, setLocalNote] = useState(initialNote);
  const [localCommentJury, setLocalCommentJury] = useState(
    project?.commentairejury?.[0]?.commentairejury ?? "",
  );
  const [localRang, setLocalRang] = useState(project?.rang ?? "-");

  const displayValue = localNote;
  const commentJury = localCommentJury;

  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const idchallenge = params.id;

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        setCurrentUser(JSON.parse(auth).user);
      } catch {}
    }
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpenMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!project || isRemoved) return null;

  const isOwner = currentUser?.id == challenge?.user_id;

  // ── Affichage du bouton crayon ──
  const shouldShowEditButton = () => {
    if (isOwner) {
      return isVoteType
        ? new Date() < new Date(challenge?.datefin)
        : challenge?.resultatdisponible == 0;
    }
    if (
      isJury &&
      Array.isArray(project?.mes_notes_criteres) &&
      project.mes_notes_criteres.length > 0
    ) {
      return challenge?.resultatdisponible == 0;
    }
    return false;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const t = toast.loading("Suppression...");
    try {
      const auth = localStorage.getItem("auth");
      const token = auth ? JSON.parse(auth).token : null;
      const res = await fetch(
        `${API_BASE_URL}/challenge/post/delete/${project.id}`,
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
        toast.success("Post supprimé", { id: t });
        setIsRemoved(true);
        setShowDeleteConfirm(false);
      } else {
        toast.error(data.message || "Erreur", { id: t });
      }
    } catch {
      toast.error("Erreur réseau", { id: t });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigateToReel = () => {
    router.push(`/challenge/${idchallenge}/reel?project=${project?.id}`);
  };

  // ✅ Mise à jour immédiate après modification de note (owner — ancien système)
  const handleUpdateNote = (newMoyenne: number) => {
    setLocalNote(newMoyenne);
    // On ne recalcule pas le rang localement car il dépend des autres projets
  };

  // ✅ Mise à jour immédiate après modification des critères (jury)
  const handleNotesSaved = (
    notefinale: number,
    updatedCriteres?: any[],
    newCommentGlobal?: string,
  ) => {
    // 1. Mettre à jour l'affichage de la carte
    setLocalNote(notefinale);

    // 2. Mettre à jour l'objet project en mémoire pour que le modal reçoive les nouvelles notes au prochain clic
    if (project) {
      project.notefinale = notefinale;

      // Si on a les nouveaux critères, on les injecte dans l'objet
      if (updatedCriteres) {
        project.mes_notes_criteres = updatedCriteres;
      }

      // Mise à jour du commentaire global localement
      if (newCommentGlobal !== undefined) {
        setLocalCommentJury(newCommentGlobal);
        if (!project.commentairejury) project.commentairejury = [{}];
        project.commentairejury[0].commentairejury = newCommentGlobal;
      }
    }
  };

  const responses = project?.responses || [];

  // mettre a jour les valeurs lors du update des notes
  useEffect(() => {
    const isVoteType = challenge?.typeevaluation?.type === "vote";
    setLocalNote(isVoteType ? project?.score : project?.notefinale);
    setLocalRang(project?.rang ?? "-");
    setLocalCommentJury(project?.commentairejury?.[0]?.commentairejury ?? "");
  }, [project, challenge]);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border w-full max-w-xl mx-auto flex flex-col mb-6 overflow-hidden transition-all">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── HEADER ── */}
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
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} /> Supprimer le post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ── RANG / NOTE ── */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          {/* Rang */}
          <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm whitespace-nowrap">
            <div className="bg-yellow-50 p-1.5 rounded-lg shrink-0">
              <Trophy size={14} className="text-yellow-600" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] text-gray-500 font-medium leading-none mb-1">
                Rang final
              </span>
              <span className="text-gray-900 leading-none truncate text-[12px]">
                {localRang || project?.rang || "-"}
              </span>
            </div>
          </div>

          {/* Note / Score */}
          <div className="flex items-center justify-between bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 p-1.5 rounded-lg shrink-0">
                <Flame size={14} className="text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-medium leading-none mb-1">
                  {isVoteType ? "Score" : "Note"} finale
                </span>
                <div className="flex items-center gap-1.5">
                  {/* ✅ Affichage immédiat via localNote */}
                  <span className="text-gray-900 leading-none text-[12px] font-black">
                    {formatKMMD(localNote || 0, !isVoteType)}
                    <span className="text-[9px] ml-0.5">
                      {!isVoteType ? "/20" : ""}
                    </span>
                  </span>
                  <button
                    onClick={() => setShowScoreDetail(true)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Info size={13} />
                  </button>
                </div>
              </div>
            </div>

            {shouldShowEditButton() && (
              <button
                onClick={() => {
                  if (isJury && project?.mes_notes_criteres?.length > 0) {
                    // ✅ Jury → ouvre EditMesNotesModal avec callback de mise à jour immédiate
                    onEditNotes?.(project, handleNotesSaved);
                  } else {
                    setShowEditScore(true);
                  }
                }}
                className="ml-2 p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border-l border-gray-100 pl-2"
              >
                <PencilLine size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="px-4 mt-5 space-y-4 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-gray-200 pb-2">
        {responses.map((r: any, idx: number) => (
          <div
            key={r?.id}
            className={!showAllFields && idx > 1 ? "hidden" : "block"}
          >
            <p className="font-bold text-sm text-gray-950 mb-1.5 first-letter:uppercase">
              {r?.challenge_field?.label || "Information"}
            </p>
            <div className="text-gray-800">
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
          </div>
        ))}
      </div>

      {responses.length > 2 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="flex-shrink-0 text-orange-600 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 py-3 border-t border-gray-50 hover:bg-orange-50/30"
        >
          {showAllFields ? (
            <>
              <ChevronUp size={16} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Voir {responses.length - 2} autres
              champs
            </>
          )}
        </button>
      )}

      {/* ── FOOTER ── */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-gray-50/50 border-t flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-black text-gray-900 leading-none">
              {project?.like}
            </span>
            <span className="text-[9px] font-bold text-gray-400 tracking-tight mt-0.5">
              Vote(s)
            </span>
          </div>
          <button
            onClick={handleNavigateToReel}
            className="flex items-center gap-1 text-gray-600 hover:text-orange-700 transition group"
          >
            <MessageCircle
              size={19}
              className="text-gray-400 group-hover:text-orange-600"
            />
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-black leading-none text-gray-900">
                {project?.commentaires_count}
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-tight mt-0.5">
                Avis
              </span>
            </div>
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-orange-700 transition group">
            <Share2
              size={19}
              className="text-gray-400 group-hover:text-orange-600"
            />
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-black leading-none text-gray-900">
                {project?.partage}
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-tight mt-0.5">
                Partage(s)
              </span>
            </div>
          </button>
        </div>
        <button
          onClick={handleNavigateToReel}
          className="p-3 bg-orange-700 cursor-pointer hover:bg-orange-600 hover:scale-105 text-white rounded-2xl shadow-lg shadow-orange-700/20 active:scale-95 transition-all"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* ── MODALS ── */}
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
            onUpdate={handleUpdateNote} // ✅ mise à jour immédiate
            onUpdateCommentJury={setLocalCommentJury}
            currentCommentJury={localCommentJury}
            user={project?.user}
          />
        )}
        <ScoreDetailModal
          postId={project?.id}
          isOpen={showScoreDetail}
          onClose={() => setShowScoreDetail(false)}
          isNoteFinale={!!project.notefinale}
          commentJury={commentJury}
          data={{
            value: displayValue || 0,
            votes: project?.like || 0,
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
