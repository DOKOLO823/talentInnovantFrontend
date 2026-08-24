"use client";

// components/modals/EvaluateProjectModal.tsx
// CORRECTIONS :
// 1. Les critères sont chargés depuis challenge.criteres (passé par ChallengeClient via show())
// 2. Les fichiers (PDF, images, vidéos) s'affichent correctement dans la colonne gauche
// 3. Swipe automatique vers projet suivant après notation (logique inchangée)

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Trophy,
  ArrowRight,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Scale,
  FileText,
  File,
  Maximize2,
  Download,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { apiFetch } from "@/app/lib/api";

// ─────────────────────────────────────────────────────────────
// Composant texte expansible
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Rendu d'une réponse — texte, image, vidéo, PDF, doc
// ─────────────────────────────────────────────────────────────
function RenderResponse({ resp }: { resp: any }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fieldData = resp.challenge_field || resp.challengeField || {};
  const label = fieldData.label ?? resp.label ?? "Réponse";
  const type = fieldData.type ?? resp.type ?? "text";
  const value = resp.value ?? resp.valeur ?? "";

  if (!value) return null;

  // Construire l'URL complète
  const fullUrl =
    value.startsWith("http") || value.startsWith("blob:")
      ? value
      : `${apifile}/${value}`;

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(value) || type === "image";
  const isVideo = /\.(mp4|mov|webm)$/i.test(value) || type === "video";
  const isPDF = /\.pdf$/i.test(value);
  const isDoc = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(value);
  const isPreviewable = isPDF || isDoc;
  const isText = ["text", "textarea", "option", "select"].includes(type);

  if (isText) {
    return (
      <div className="mb-4 p-4 bg-white border border-slate-100 rounded-2xl">
        <p className="text-[10px] font-black uppercase text-orange-600 mb-1 tracking-widest">
          {label}
        </p>
        <ResponseReadMore text={value} />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="mb-6">
        <p className="text-[10px] font-black text-orange-600 uppercase mb-2">
          {label}
        </p>
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          className="rounded-2xl w-full aspect-video bg-black shadow-sm"
        >
          <source src={fullUrl} />
        </video>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="mb-6">
        <p className="text-[10px] font-black text-orange-600 uppercase mb-2">
          {label}
        </p>
        <img
          src={fullUrl}
          className="rounded-2xl w-full object-cover border bg-white shadow-sm max-h-[400px]"
          alt={label}
        />
      </div>
    );
  }

  if (isPreviewable) {
    const viewerUrl = isPDF
      ? `${fullUrl}#toolbar=0`
      : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;

    return (
      <div className="mb-6">
        <p className="text-[10px] font-black text-orange-600 uppercase mb-2">
          {label}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                {isPDF ? <FileText size={14} /> : <File size={14} />}
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                {isPDF ? "Document PDF" : "Document Office"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 hover:bg-orange-50 text-orange-600 rounded-xl flex items-center gap-1 text-[10px] font-black uppercase"
              >
                <Maximize2 size={14} /> Agrandir
              </button>
              <a
                href={fullUrl}
                download
                className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl"
              >
                <Download size={14} />
              </a>
            </div>
          </div>

          {/* Aperçu inline */}
          <div className="relative w-full h-[350px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <iframe
              src={viewerUrl}
              className="w-full h-full border-none"
              title={label}
              loading="lazy"
            />
          </div>
        </div>

        {/* Plein écran */}
        <AnimatePresence>
          {isFullscreen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFullscreen(false)}
                className="absolute inset-0 bg-slate-900/95"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full h-full bg-white md:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-bold text-sm text-slate-700">
                    {label}
                  </span>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <iframe src={viewerUrl} className="w-full flex-1 border-none" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fichier générique
  return (
    <div className="mb-4">
      <p className="text-[10px] font-black text-orange-600 uppercase mb-2">
        {label}
      </p>
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-200 transition"
      >
        <div className="flex items-center gap-3">
          <File size={18} className="text-slate-400" />
          <span className="font-bold text-xs text-slate-700 truncate">
            {label}
          </span>
        </div>
        <span className="text-[10px] text-orange-600 font-black uppercase bg-orange-50 px-3 py-2 rounded-xl">
          Ouvrir
        </span>
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function EvaluateProjectModal({
  initialProjectId,
  projectsList,
  onClose,
  onProjectEvaluated,
  challenge,
}: {
  initialProjectId: any;
  projectsList: any[];
  onClose: () => void;
  onProjectEvaluated: (id: number) => void;
  challenge: any;
}) {
  const [localProjects] = useState([...projectsList]);
  const initialIdx = localProjects.findIndex(
    (p: any) => p.id === initialProjectId,
  );
  const [currentIndex, setCurrentIndex] = useState(
    initialIdx !== -1 ? initialIdx : 0,
  );
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [commentaireGlobal, setCommentaireGlobal] = useState("");
  const [critereNotes, setCritereNotes] = useState<
    Record<number, { note: string; commentaire: string }>
  >({});
  const [criteres, setCriteres] = useState<any[]>([]);
  const [loadingCriteres, setLoadingCriteres] = useState(false);

  // ── Chargement des critères ──
  useEffect(() => {
    // Priorité 1 : depuis la prop challenge.criteres (renvoyé par show())
    if (
      challenge?.criteres &&
      Array.isArray(challenge.criteres) &&
      challenge.criteres.length > 0
    ) {
      setCriteres(challenge.criteres);
      return;
    }

    // Priorité 2 : appel API dédié
    if (challenge?.id) {
      setLoadingCriteres(true);
      // On appelle show() qui renvoie maintenant les critères dans data.criteres
      apiFetch(`/challenge/details/${challenge.id}`, { method: "GET" })
        .then((res) => {
          if (res?.statut === 200 && res.data?.criteres?.length > 0) {
            setCriteres(res.data.criteres);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCriteres(false));
    }
  }, [challenge]);

  // Reset notes lors du changement de projet
  useEffect(() => {
    setCritereNotes({});
    setCommentaireGlobal("");
  }, [currentIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const project = localProjects[currentIndex];
  const isFinalInModal = currentIndex === localProjects.length - 1;

  // ── Mise à jour note ──
  const updateNote = (
    critereId: number,
    field: "note" | "commentaire",
    value: string,
  ) => {
    setCritereNotes((prev) => ({
      ...prev,
      [critereId]: { ...prev[critereId], [field]: value },
    }));
  };

  // ── Aperçu moyenne pondérée en temps réel ──
  const calculerMoyenneApercu = (): number | null => {
    if (criteres.length === 0) return null;
    let sommePond = 0,
      sommeCoef = 0;
    for (const c of criteres) {
      const note = parseFloat(critereNotes[c.id]?.note ?? "");
      if (isNaN(note)) return null;
      const coef = c.coefficient ?? 1;
      sommePond += note * coef;
      sommeCoef += coef;
    }
    return sommeCoef > 0 ? Math.round((sommePond / sommeCoef) * 100) / 100 : 0;
  };

  const apercu = calculerMoyenneApercu();

  // ── Soumission des notes ──
  const handleEvaluate = async () => {
    if (criteres.length === 0) {
      toast.error("Aucun critère d'évaluation défini pour ce challenge.");
      return;
    }

    // Validation
    for (const c of criteres) {
      const noteStr = critereNotes[c.id]?.note ?? "";
      const note = parseFloat(noteStr);
      if (isNaN(note) || note < 0) {
        toast.error(`Note manquante pour : ${c.libelle}`);
        return;
      }
      if (note > 20) {
        toast.error(`La note pour "${c.libelle}" ne peut pas dépasser 20.`);
        return;
      }
    }

    setLoading(true);
    const loadingToast = toast.loading("Enregistrement...");

    try {
      const notes = criteres.map((c) => ({
        critere_id: c.id,
        note: parseFloat(critereNotes[c.id]?.note ?? "0"),
        commentaire: critereNotes[c.id]?.commentaire ?? "",
      }));

      const res = await apiFetch("/challenge/post/noter-criteres", {
        method: "POST",
        body: JSON.stringify({
          post_id: project.id,
          notes,
          commentaire_global: commentaireGlobal,
        }),
      });
      // console.log("Résultat notation :", res);

      if (res?.statut === 200) {
        toast.success(
          `Note enregistrée — Moyenne jury : ${res.note_finale}/20`,
          { id: loadingToast },
        );
        const currentId = project.id;

        if (isFinalInModal) {
          onProjectEvaluated?.(currentId);
          onClose();
        } else {
          // Swipe automatique vers projet suivant
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
          setTimeout(() => onProjectEvaluated?.(currentId), 300);
        }
      } else {
        toast.error(res?.message || "Erreur", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Erreur réseau", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  const responses = project.responses ?? project.reponses ?? [];

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[500] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-slate-50 w-full h-full md:max-w-6xl md:h-[90vh] flex flex-col md:rounded-[2rem] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-4 py-3 md:px-8 md:py-5 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 hidden md:block">
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
                  setCurrentIndex((p) => p - 1);
                }}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-20"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentIndex === localProjects.length - 1}
                onClick={() => {
                  setDirection(1);
                  setCurrentIndex((p) => p + 1);
                }}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-20"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Colonne gauche : réponses du projet */}
          <div className="md:flex-1 p-4 md:p-8 md:overflow-y-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                {/* Info talent */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 mb-6 shadow-sm">
                  <Image
                    src={
                      project?.user?.pp
                        ? `${apifile}/${project.user.pp}`
                        : "/assets/images/pp2.png"
                    }
                    width={48}
                    height={48}
                    alt="pp"
                    className="rounded-xl h-12 w-12 object-cover border-2 border-slate-50"
                  />
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {project?.user?.talent?.nom ??
                        project?.user?.name ??
                        "Participant"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {project?.user?.talent?.profession ?? "Participant"}
                    </p>
                  </div>
                </div>

                {/* Réponses */}
                {responses.length > 0 ? (
                  responses.map((resp: any) => (
                    <RenderResponse key={resp.id} resp={resp} />
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-sm py-8">
                    Aucune réponse soumise pour ce projet.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Colonne droite : formulaire de notation */}
          <div className="flex md:w-[380px] w-full bg-white border-t md:border-t-0 md:border-l p-6 flex-col gap-4 md:overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={16} className="text-orange-700" />
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                Notation par critère
              </h3>
            </div>

            {loadingCriteres ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-orange-700" size={24} />
              </div>
            ) : criteres.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-amber-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      Aucun critère défini
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Ce challenge n'a pas encore de critères d'évaluation
                      configurés. Veuillez les ajouter dans les paramètres du
                      challenge.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Critères */}
                {criteres.map((c) => (
                  <div
                    key={c.id}
                    className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800 flex-1">
                        {c.libelle}
                      </p>
                      <span className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
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
                        value={critereNotes[c.id]?.note ?? ""}
                        onChange={(e) =>
                          updateNote(c.id, "note", e.target.value)
                        }
                        className="w-20 border border-slate-200 rounded-xl p-2 text-sm text-center font-bold focus:border-orange-700 focus:ring-1 focus:ring-orange-200 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Commentaire (optionnel)"
                        value={critereNotes[c.id]?.commentaire ?? ""}
                        onChange={(e) =>
                          updateNote(c.id, "commentaire", e.target.value)
                        }
                        className="flex-1 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-orange-700"
                      />
                    </div>
                  </div>
                ))}

                {/* Aperçu moyenne */}
                {apercu !== null && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                      Aperçu moyenne jury
                    </p>
                    <p className="text-2xl font-black text-orange-700">
                      {apercu}
                      <span className="text-sm font-normal">/20</span>
                    </p>
                  </div>
                )}

                {/* Commentaire global */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Commentaire global sur le projet
                  </label>
                  <textarea
                    rows={3}
                    value={commentaireGlobal}
                    onChange={(e) => setCommentaireGlobal(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-orange-400 outline-none text-sm resize-none"
                    placeholder="Avis global sur le projet..."
                  />
                </div>

                {/* Bouton noter */}
                <button
                  onClick={handleEvaluate}
                  disabled={loading}
                  className={`hidden md:flex w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all
                    ${isFinalInModal ? "bg-green-600" : "bg-orange-700"}
                    text-white shadow-xl active:scale-95 disabled:opacity-50`}
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
              </>
            )}
          </div>
        </div>

        {/* Mobile footer */}
        <div className="md:hidden p-4 bg-white border-t sticky bottom-0 z-10">
          <button
            onClick={handleEvaluate}
            disabled={loading || criteres.length === 0}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3
              ${isFinalInModal ? "bg-green-600" : "bg-orange-700"} text-white disabled:opacity-50`}
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
    </div>
  );
}
