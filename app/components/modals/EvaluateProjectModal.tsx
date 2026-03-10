"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Trophy,
  ArrowRight,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  File,
  EyeOff,
  FileSearch,
  Eye,
  Download,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { API_BASE_URL } from "@/app/lib/api";

function ResponseReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const limit = 200;
  if (!text || text.length <= limit)
    return <p className="text-gray-800 leading-relaxed text-[15px]">{text}</p>;
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

export default function EvaluateProjectModal({
  initialProjectId,
  projectsList,
  onClose,
  onProjectEvaluated,
}: {
  initialProjectId: any;
  projectsList: any[];
  onClose: () => void;
  onProjectEvaluated: (id: number) => void;
}) {
  const [localProjects] = useState([...projectsList]);
  const initialIdx = localProjects.findIndex(
    (p: any) => p.id === initialProjectId,
  );
  const [currentIndex, setCurrentIndex] = useState(
    initialIdx !== -1 ? initialIdx : 0,
  );

  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ note?: string }>({});
  const [direction, setDirection] = useState(0);

  // État pour gérer les aperçus de documents
  const [activePreviews, setActivePreviews] = useState<Record<string, boolean>>(
    {},
  );
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const project = localProjects[currentIndex];
  const isFinalInModal = currentIndex === localProjects.length - 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleEvaluate = async () => {
    if (!note || isNaN(Number(note)) || Number(note) < 0) {
      setErrors({ note: "Note requise" });
      return;
    }
    if (note && Number(note) > Number(20)) {
      setErrors({ note: "La note ne doit pas dépasser 20" });
      toast.error("La note ne doit pas dépasser 20");
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading("Enregistrement de la note...");
    try {
      const storedAuth = localStorage.getItem("auth");
      const token = storedAuth ? JSON.parse(storedAuth).token : null;
      const response = await fetch(`${API_BASE_URL}/post/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: project.id,
          note: note,
          commentairejury: comment,
        }),
      });
      const data = await response.json();
      console.log(response);
      if (data.statut == 200) {
        toast.success("Note enregistrée", { id: loadingToast });
        const currentId = project.id;
        if (currentIndex === localProjects.length - 1) {
          onProjectEvaluated?.(currentId);
          onClose();
        } else {
          setDirection(1);
          setNote("");
          setComment("");
          setActivePreviews({}); // Reset des aperçus au changement de projet
          setCurrentIndex((prev) => prev + 1);
          setTimeout(() => {
            onProjectEvaluated?.(currentId);
          }, 300);
        }
      } else {
        toast.error(data.message || "Erreur", {
          id: loadingToast,
          duration: 5000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Erreur réseau", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (resp: any) => {
    const { label, type } = resp.challenge_field || {};
    const value = resp.value;
    if (!value) return null;

    const fullUrl = value?.startsWith("http") ? value : `${apifile}/${value}`;
    const isImage = value.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const isVideo = value.match(/\.(mp4|mov|webm)$/i);
    const isPDF = value.match(/\.pdf$/i);
    const isDoc = value.match(/\.(docx|doc|pptx|ppt|xlsx|xls)$/i);
    const isPreviewable = isPDF || isDoc;

    if (type === "text" || type === "textarea" || type === "option") {
      return (
        <div className="mb-4 p-4 bg-white border border-slate-100 rounded-2xl">
          <p className="text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">
            {label}
          </p>
          <ResponseReadMore text={value} />
        </div>
      );
    }

    return (
      <div className="mb-6">
        <p className="text-[10px] font-black text-orange-600 uppercase mb-2 ml-1">
          {label}
        </p>

        {isVideo ? (
          <video
            controls
            className="rounded-2xl w-full aspect-video bg-black shadow-sm"
          >
            <source src={fullUrl} />
          </video>
        ) : isImage ? (
          <img
            src={fullUrl}
            className="rounded-2xl w-full object-cover border bg-white shadow-sm"
            alt={label}
          />
        ) : isPreviewable ? (
          /* RENDU DOCUMENT DIRECTEMENT VISIBLE */
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
                    setIsFullscreenPreview({ url: fullUrl, label: label })
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

            {/* ZONE D'APERÇU SUR LA CARD (Visible immédiatement) */}
            <div className="relative w-full h-[400px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-orange-100/50">
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
          /* CAS PAR DÉFAUT SI NON PRÉVISUALISABLE */
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200"
          >
            <span className="font-bold text-xs text-slate-700 truncate mr-2">
              {label}
            </span>
            <span className="text-[10px] text-orange-600 font-black uppercase whitespace-nowrap bg-orange-50 px-3 py-2 rounded-xl">
              Ouvrir
            </span>
          </a>
        )}
      </div>
    );
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[500] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-slate-50 w-full h-full md:max-w-6xl md:h-[90vh] flex flex-col md:rounded-[2rem] overflow-hidden"
      >
        <div className="flex justify-between items-center px-4 py-3 md:px-8 md:py-5 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 md:block hidden">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-sm md:text-lg leading-none">
                Évaluation
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                Projet {currentIndex + 1}/{localProjects.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setDirection(-1);
                  setCurrentIndex((prev) => prev - 1);
                }}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentIndex === localProjects.length - 1}
                onClick={() => {
                  setDirection(1);
                  setCurrentIndex((prev) => prev + 1);
                }}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-20 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-none">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 mb-6 shadow-sm">
                  <Image
                    src={`${apifile}/${project?.user?.pp}`}
                    width={48}
                    height={48}
                    alt="pp"
                    className="rounded-xl h-12 w-12 object-cover border-2 border-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">
                      {project?.user?.talent?.nom || project?.user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
                      {project?.user?.talent?.profession || "Participant"}
                    </p>
                  </div>
                </div>

                <div className="pb-24 md:pb-0">
                  {project.responses?.map((resp: any) => (
                    <div key={resp.id}>{renderResponse(resp)}</div>
                  ))}

                  <div className="md:hidden mt-8 pt-8 border-t border-slate-200 space-y-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Votre Note (sur 20)
                      </p>
                      <input
                        type="number"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-24 text-center text-xl font-black text-orange-600 p-3 bg-white border-2 border-orange-100 rounded-2xl outline-none"
                        placeholder="-"
                      />
                    </div>
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none text-sm"
                        placeholder="Observations (facultatif)..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex w-[350px] bg-white border-l p-8 flex-col justify-between">
            <div className="space-y-8">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  Note Finale (sur 20)
                </span>
                <input
                  type="number"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-center text-6xl font-black text-slate-800 p-4 bg-slate-50 rounded-3xl outline-none border-4 border-transparent focus:border-orange-100 transition-all"
                  placeholder="/20"
                />
                {errors.note && (
                  <p className="text-red-500 text-[10px] font-bold mt-2">
                    {errors.note}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Commentaire
                </label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-50 focus:bg-white outline-none text-sm transition-all resize-none shadow-inner"
                  placeholder="Justifiez votre note..."
                />
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${isFinalInModal ? "bg-green-600 shadow-green-200" : "bg-orange-700 shadow-orange-200"} text-white shadow-xl active:scale-95`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isFinalInModal ? (
                <>
                  <CheckCircle size={20} /> TERMINER
                </>
              ) : (
                <>
                  <ArrowRight size={20} /> NOTER & SUIVANT
                </>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden p-4 bg-white border-t sticky bottom-0 z-20 shadow-lg">
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 ${isFinalInModal ? "bg-green-600" : "bg-orange-700"} text-white`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isFinalInModal ? (
              "TERMINER L'ÉVALUATION"
            ) : (
              "NOTER ET CONTINUER"
            )}
          </button>
        </div>
      </motion.div>

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
