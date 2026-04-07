"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Share2,
  MessageCircle,
  Maximize2,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquare,
  Facebook,
  AlertTriangle,
  PencilLine,
  Download,
  FileText,
  File,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apifile from "@/app/lib/apifile";
import ScoreDetailModal from "../modals/ScoreDetailModal";
import { formatKMMD } from "@/app/utils/formatters";

/* ================= COMPOSANTS AUXILIAIRES ================= */

function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const limit = 120;
  if (!text) return null;
  return (
    <p className="text-gray-700 text-sm leading-relaxed">
      {open || text.length <= limit ? text : text.slice(0, limit) + "..."}
      {text.length > limit && (
        <button
          onClick={() => setOpen(!open)}
          className="ml-1 text-orange-600 font-medium"
        >
          {open ? "voir moins" : "voir plus"}
        </button>
      )}
    </p>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
      >
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">Supprimer le projet ?</h3>
        <p className="text-gray-600 text-sm mb-6">
          Cette action est irréversible. Voulez-vous vraiment continuer ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= COMPOSANT PRINCIPAL ================= */

export default function ProjectCardProfile({ project, challenge }: any) {
  // const [openMenu, setOpenMenu] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  // const [openShare, setOpenShare] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const [showScoreDetail, setShowScoreDetail] = useState(false);
  // Déterminer le type de valeur à afficher
  const isVoteType =
    project?.challenge?.typeevaluation === "vote" ||
    project?.challenge?.resultatdisponible === 0;
  const displayValue = isVoteType ? project?.score : project?.notefinale;
  const labelBadge = isVoteType ? "Score final" : "Note finale";
  const commentJury = project?.commentairejury?.[0]?.commentaire || "";

  const router = useRouter();
  const params = useParams();
  const idchallenge = project.challenge?.id;
  // console.log(project)

  const handleNavigateToReel = () => {
    if (
      (project?.challenge?.typeevaluation != "vote" && project.notefinale) ||
      project?.challenge?.typeevaluation == "hybride"
    ) {
      const query = new URLSearchParams({
        project: project.id.toString(),
      }).toString();
      router.push(`/challenge/${idchallenge}/reel?${query}`);
    }
  };

  const visibleResponses = showAllFields
    ? project.responses
    : project.responses?.slice(0, 2) || [];

  function ResponseReadMore({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    const limit = 200;
    if (!text || text.length <= limit)
      return (
        <p className="text-gray-800 leading-relaxed text-[15px]">{text}</p>
      );
    return (
      <p className="text-gray-800 leading-relaxed text-[15px]">
        {open ? text : text.slice(0, limit) + "..."}
        <button
          onClick={() => setOpen(!open)}
          className="ml-2 text-orange-700 font-black text-[10px] uppercase tracking-wider"
        >
          {open ? "Réduire" : "Lire la suite"}
        </button>
      </p>
    );
  }

  // 1. On crée un mini-composant interne pour gérer la logique vidéo propre
  const VideoPlayer = ({ src, label }: { src: string; label: string }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting && videoRef.current) {
              videoRef.current.pause();
            }
          });
        },
        { threshold: 0.2 },
      );

      if (videoRef.current) observer.observe(videoRef.current);
      return () => observer.disconnect();
    }, []);

    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      document.querySelectorAll("video").forEach((vid) => {
        if (vid !== e.currentTarget) vid.pause();
      });
    };

    return (
      <video
        ref={videoRef}
        controls
        onPlay={handlePlay}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="rounded-2xl w-full h-[170px] aspect-video bg-black shadow-sm"
      >
        <source src={src} />
      </video>
    );
  };

  const renderResponse = (resp: any) => {
    const fieldData = resp.challenge_field || resp.field || {};
    const { label, type } = fieldData;

    const value = resp.value;
    if (!value) return null;

    const fullUrl = value?.startsWith("http") ? value : `${apifile}/${value}`;
    const isImage = value.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const isVideo = value.match(/\.(mp4|mov|webm)$/i);
    const isPDF = value.match(/\.pdf$/i);
    const isDoc = value.match(/\.(docx|doc|pptx|ppt|xlsx|xls)$/i);
    const isPreviewable = isPDF || isDoc;

    if (["text", "textarea", "option", "select"].includes(type)) {
      return (
        <div className="mb-4 py-4 bg-white border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">
            {label || "Information"}
          </p>
          <ResponseReadMore text={value} />
        </div>
      );
    }

    return (
      <div className="mb-6">
        <p className="text-[10px] font-black text-orange-600 uppercase mb-2 ml-1">
          {label || "Fichier joint"}
        </p>

        {isVideo ? (
          /* Utilisation du mini-composant ici */
          <VideoPlayer src={fullUrl} label={label || "Vidéo"} />
        ) : isImage ? (
          <img
            src={fullUrl}
            className="rounded-2xl w-full object-cover border bg-white shadow-sm"
            alt={label}
          />
        ) : isPreviewable ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  {isPDF ? <FileText size={14} /> : <File size={14} />}
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                  Document
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setIsFullscreenPreview({
                      url: fullUrl,
                      label: label || "Document",
                    })
                  }
                  className="p-2 hover:bg-orange-100 text-orange-600 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                >
                  <Maximize2 size={16} /> Agrandir
                </button>
                <a
                  href={fullUrl}
                  download
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>

            <div className="relative w-full h-[300px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <iframe
                src={
                  isPDF
                    ? `${fullUrl}#toolbar=0`
                    : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
                }
                className="w-full h-full border-none"
                title={label}
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200"
          >
            <span className="font-bold text-xs text-slate-700 truncate mr-2">
              {label || "Voir le fichier"}
            </span>
            <span className="text-[10px] text-orange-600 font-black uppercase whitespace-nowrap bg-orange-50 px-3 py-2 rounded-xl">
              Ouvrir
            </span>
          </a>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative bg-white rounded-2xl shadow border w-full max-w-xl mx-auto ${((project?.challenge?.typeevaluation == "vote" && new Date(project?.challenge?.datefin) < new Date()) || (project?.challenge?.typeevaluation != "vote" && project?.challenge?.resultatdisponible == 1)) && project?.challenge?.portee == "public" ? "flex" : "hidden"} flex-col mb-6 p-1`}
    >
      {/* HEADER USER & DROPDOWN */}
      <div className="flex justify-between p-4 pb-2">
        <div className="flex items-center gap-3 cursor-pointer">
          <Image
            src={
              project.author.avatar
                ? project?.author?.avatar
                : "../assets/images/pp2.png"
            }
            width={44}
            height={44}
            alt="avatar"
            className="rounded-full object-cover aspect-square"
          />
          <div>
            <p className="font-semibold hover:text-orange-600 transition-colors line-clamp-2">
              {project.author.name}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.author.role}
            </p>
          </div>
        </div>
      </div>

      {/* INFOS DU CHALLENGE LIÉ */}
      {project.challenge && (
        <div className="px-4">
          <Link
            href={`/challenge/${project.challenge.id}`}
            className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100"
          >
            <Image
              src={project?.challenge?.image}
              width={40}
              height={40}
              alt="challenge"
              className="rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-bold text-gray-800 line-clamp-2">
                {project?.challenge?.name}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Voir le challenge
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* CONTENT (RESPONSES) */}
      <div
        className={`px-4 mt-2 transition-all ${showAllFields ? "max-h-[230px] overflow-y-auto" : "overflow-y-auto max-h-[180px]"}`}
      >
        {((project?.challenge?.typeevaluation == "jury" &&
          project?.challenge?.resultatdisponible == 1) ||
          project?.challenge?.typeevaluation != "jury") && (
          <div className="">
            {/* Grille de badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              {/* Badge Rang */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm whitespace-nowrap">
                <div className="bg-yellow-50 p-1.5 rounded-lg">
                  <Trophy size={14} className="text-yellow-600 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-medium leading-none mb-0.5">
                    Rang final
                  </span>
                  <span className="text-gray-900 leading-none text-[12px]">
                    {project?.rank || "-"}{" "}
                    {project?.nombreposts > 0 && project?.nombreposts != 0 && (
                      <span className="text-[9px] font-normal">
                        {"/" + project?.nombreposts || ""} projet(s)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Badge Score / Note */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm whitespace-nowrap">
                <div className="bg-orange-50 p-1.5 rounded-lg">
                  <Flame size={14} className="text-orange-600 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-medium leading-none mb-0.5">
                    {labelBadge}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-gray-900 leading-none ${displayValue ? "text-[12px] font-black" : "text-xs font-bold"}`}
                    >
                      {formatKMMD(
                        displayValue ? displayValue : null,
                        !isVoteType,
                      )}
                      {/* { {displayValue ? displayValue.toFixed(2) : "Aucune note"} */}
                      {!isVoteType && displayValue && (
                        <span className="text-[9px] font-normal"> /20</span>
                      )}
                    </span>
                    {/* L'icône Info pour ouvrir l'analyse détaillée */}
                    {(displayValue || displayValue == 0) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowScoreDetail(true);
                        }}
                        className="text-gray-400 hover:text-orange-600 transition-colors"
                      >
                        <Info size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {visibleResponses.map((r: any) => (
          <div key={r.id}>{renderResponse(r)}</div>
        ))}
      </div>

      {/* VOIR PLUS (ACCORDEON) */}
      {project.responses?.length > 2 && (
        <button
          onClick={() => setShowAllFields(!showAllFields)}
          className="text-orange-700 text-sm font-bold flex items-center justify-center gap-1 py-3 hover:bg-orange-50 transition border-t border-b border-gray-50"
        >
          {showAllFields ? (
            <>
              <ChevronUp size={18} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={18} /> Voir plus de détails
            </>
          )}
        </button>
      )}

      {/* FOOTER */}
      <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
        <span className="text-sm font-bold text-gray-500">
          {project.vote || 0} vote(s)
        </span>
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-700 transition">
            <MessageCircle size={15} onClick={handleNavigateToReel} />{" "}
            <span className="text-xs font-medium">
              ({project?.nombreCommentaire})
            </span>
          </button>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-orange-700 transition">
            <Share2 size={14} /> ({project?.partage})
          </button>
          {(project?.challenge?.typeevaluation != "vote" &&
            project.notefinale) ||
          project?.challenge?.typeevaluation == "hybride" ? (
            <Maximize2
              className="text-orange-700 cursor-pointer hover:scale-110 transition"
              size={20}
              onClick={handleNavigateToReel}
            />
          ) : (
            ""
          )}
        </div>
      </div>

      <ScoreDetailModal
        postId={project?.id}
        isOpen={showScoreDetail}
        onClose={() => setShowScoreDetail(false)}
        isNoteFinale={project.notefinale ? true : false}
        commentJury={commentJury}
        data={{
          value: displayValue || 0,
          votes: project?.like || 0,
          shares: project?.partage || 0,
          comments: project?.nombreCommentaire || 0,
        }}
      />

      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => setShowConfirmDelete(false)}
      />

      {/* modal preview document sur grand ecran  */}
      <AnimatePresence>
        {isFullscreenPreview && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullscreenPreview(null)}
              className="absolute inset-0 bg-slate-900/95"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full h-full bg-white md:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <p className="font-black text-slate-800 text-sm">
                  {isFullscreenPreview.label}
                </p>
                <button
                  onClick={() => setIsFullscreenPreview(null)}
                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <iframe
                src={
                  isFullscreenPreview.url.match(/\.pdf$/i)
                    ? isFullscreenPreview.url
                    : `https://docs.google.com/gview?url=${encodeURIComponent(isFullscreenPreview.url)}&embedded=true`
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
