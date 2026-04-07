"use client";

// components/modals/ScoreDetailModal.tsx — VERSION FINALE
// CAS 1 : isNoteFinale=false → score par interactions (votes, partages, commentaires)
// CAS 2 : isNoteFinale=true  → notes par critères/jurys (nouveau) OU commentaire jury (ancien)

import React, { useEffect, useState } from "react";
import {
  X,
  ThumbsUp,
  MessageSquare,
  Share2,
  BarChart3,
  Quote,
  Loader2,
  Scale,
  User,
  Award,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

interface ScoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { value: number; votes: number; shares: number; comments: number };
  isNoteFinale: boolean;
  commentJury?: string;
  postId?: number | string;
}

// ── Ligne stat interaction avec barre de progression ──
function StatRow({
  label,
  sublabel,
  count,
  points,
  icon,
  color,
  percent,
}: any) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100">
      <div className={`${color} p-2.5 rounded-xl shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="font-black text-slate-900 text-sm">
            +{points}{" "}
            <span className="text-[10px] font-normal text-slate-600">pts</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-700 shrink-0 font-medium">
            {count} {sublabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Card jury accordéon ──
function JuryCard({ juryData }: { juryData: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header — clic pour expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col items-center gap-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 shadow-sm transition-colors text-left"
      >
        <>
          <div className="flex items-center gap-x-2.5">
            {juryData.jury_pp ? (
              <img
                src={
                  String(juryData.jury_pp).startsWith("http")
                    ? juryData.jury_pp
                    : `${apifile}/${juryData.jury_pp}`
                }
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                alt={juryData.jury_nom}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shrink-0">
                <User size={16} className="text-orange-700" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                {juryData.jury_nom}
              </p>
              <p className="text-[12px] text-slate-500 font-bold tracking-wider">
                Jury évaluateur
              </p>
            </div>
          </div>
        </>
        <>
          <div className="text-right mr-2 shrink-0 flex flex-col justify-center items-center">
            <p className="text-[12px] text-slate-800 font-medium mb-0.5">
              Moyenne accordée par ce jury <span className="font-bold">:</span>
            </p>
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className="text-xl font-black text-orange-700">
                {juryData.moyenne_jury}
              </span>
              <span className="text-xs text-orange-400 font-bold">/20</span>
            </div>
          </div>
          <div className="text-orange-700 shrink-0 flex flex-col justify-center items-center text-xs cursor-pointer">
            <span>
              {expanded ? "Voir moins de détails" : "Voir plus de détails"}
            </span>
            <span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </>
      </button>

      {/* Contenu accordéon */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {/* En-têtes colonnes */}
            <div className="grid grid-cols-[32px_1fr_64px] gap-2 px-4 py-2 border-b border-slate-50 bg-white">
              <span className="text-[9px] font-black text-slate-500 uppercase text-center">
                Coef
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase">
                Critère
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase text-right">
                Note
              </span>
            </div>

            {/* Lignes critères */}
            <div className="px-4 py-2 space-y-1.5 bg-white">
              {juryData.notes_criteres?.map((nc: any, i: number) => (
                <div key={i}>
                  <div className="grid grid-cols-[32px_1fr_64px] gap-2 items-center py-1.5">
                    <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-700 text-[10px] font-black flex items-center justify-center border border-orange-100 mx-auto">
                      {nc.coefficient}
                    </div>
                    <span className="text-sm text-slate-700 font-medium leading-tight line-clamp-5">
                      {nc.libelle}
                    </span>
                    <div className="text-right">
                      <span className="font-black text-slate-900">
                        {nc.note}
                      </span>
                      <span className="text-[10px] text-slate-400">/20</span>
                    </div>
                  </div>
                  {nc.commentaire && (
                    <div className="ml-10 mb-1 px-3 py-1.5 bg-slate-50 rounded-lg border-l-2 border-orange-200">
                      <p className="text-[10px] text-slate-500 italic line-clamp-20">
                        "{nc.commentaire}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Commentaire global du jury */}
            {juryData.commentaire_global && (
              <div className="px-4 pb-4 pt-1 bg-white">
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <Quote
                    size={14}
                    className="text-orange-400 mt-0.5 shrink-0"
                    fill="currentColor"
                  />
                  <div>
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">
                      Avis général
                    </p>
                    <p className="text-[11px] text-slate-700 italic leading-relaxed line-clamp-30">
                      {juryData.commentaire_global}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ──
export default function ScoreDetailModal({
  isOpen,
  onClose,
  data,
  isNoteFinale,
  commentJury,
  postId,
}: ScoreDetailModalProps) {
  const [detailNotes, setDetailNotes] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDetailNotes(null);
      return;
    }
    if (!postId || !isNoteFinale) return;
    setLoadingDetail(true);
    apiFetch(`/challenge/post/notes/${postId}`, { method: "GET" })
      .then((res) => {
        if (res?.statut === 200) setDetailNotes(res);
      })
      .catch(console.error)
      .finally(() => setLoadingDetail(false));
  }, [isOpen, postId, isNoteFinale]);

  if (!isOpen) return null;

  const WEIGHTS = { VOTE: 2, SHARE: 4, COMMENT: 5 };
  const totalValue = isNoteFinale
    ? Number(data.value).toFixed(2)
    : Math.floor(data.value);
  const votePoints = data.votes * WEIGHTS.VOTE;
  const sharePoints = data.shares * WEIGHTS.SHARE;
  const commentPoints = Math.max(
    0,
    Math.floor(data.value) - votePoints - sharePoints,
  );
  const totalForPct = Math.max(votePoints + sharePoints + commentPoints, 1);

  const hasDetailedNotes = detailNotes?.par_jury?.length > 0;
  const hasAncienCommentaire = !hasDetailedNotes && !!commentJury;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-700" />
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-widest">
              {isNoteFinale
                ? "Résultat & évaluation du jury"
                : "Détail du score"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Valeur principale */}
          <div className="flex flex-col items-center text-center py-2">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 border ${
                isNoteFinale
                  ? "bg-orange-50 border-orange-100"
                  : "bg-orange-50 border-orange-100"
              }`}
            >
              {isNoteFinale ? (
                <Award className="text-orange-700" size={30} />
              ) : (
                <Trophy className="text-orange-700" size={30} />
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-1">
              {isNoteFinale ? "Note finale" : "Score provisoire"}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-900">
                {totalValue}
              </span>
              <span
                className={`text-xl font-bold ${isNoteFinale ? "text-orange-600" : "text-orange-700"}`}
              >
                {isNoteFinale ? "/20" : " pts"}
              </span>
            </div>
          </div>

          {/* ══ CAS 1 : Score interactions ══ */}
          {!isNoteFinale && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Composition du score :
              </p>
              <StatRow
                label="Votes reçus"
                sublabel="vote(s)"
                count={data.votes}
                points={votePoints}
                percent={(votePoints / totalForPct) * 100}
                icon={<ThumbsUp className="text-orange-700" size={16} />}
                color="bg-orange-50"
              />
              <StatRow
                label="Partages"
                sublabel="partage(s)"
                count={data.shares}
                points={sharePoints}
                percent={(sharePoints / totalForPct) * 100}
                icon={<Share2 className="text-orange-700" size={16} />}
                color="bg-orange-50"
              />
              <StatRow
                label="Commentaires"
                sublabel="commentaire(s)"
                count={data.comments}
                points={commentPoints}
                percent={(commentPoints / totalForPct) * 100}
                icon={<MessageSquare className="text-orange-700" size={16} />}
                color="bg-orange-50"
              />
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-500">
                  <span className="font-bold">Vote = {WEIGHTS.VOTE} pts</span>
                  {" · "}
                  <span className="font-bold">
                    Partage = {WEIGHTS.SHARE} pts
                  </span>
                  {" · "}
                  <span className="font-bold">
                    Commentaire = {WEIGHTS.COMMENT} pts
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ══ CAS 2 : Note jury ══ */}
          {isNoteFinale && (
            <>
              {loadingDetail ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="animate-spin text-orange-700" size={28} />
                  <p className="text-sm text-slate-600">
                    Chargement du détail des notes...
                  </p>
                </div>
              ) : hasDetailedNotes ? (
                /* Nouveau système — critères + jurys */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Scale size={14} className="text-orange-700" />
                    <p className="text-[12px] font-black text-slate-500 tracking-widest">
                      Évalué par {detailNotes.par_jury.length} jury
                      {detailNotes.par_jury.length > 1 ? "s" : ""} :
                    </p>
                  </div>

                  {detailNotes.par_jury.map((juryData: any) => (
                    <JuryCard key={juryData.jury_id} juryData={juryData} />
                  ))}

                  {detailNotes.par_jury.length > 1 && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-orange-700 uppercase tracking-wide">
                          Note finale globale
                        </p>
                        <p className="text-[10px] text-orange-500 mt-0.5">
                          Moyenne des {detailNotes.par_jury.length} jurys
                        </p>
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-black text-orange-700">
                          {detailNotes.note_finale}
                        </span>
                        <span className="text-sm text-orange-500 font-bold">
                          /20
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-white border border-orange-700 rounded-xl text-center">
                    <p className="text-[10px] text-orange-700 font-medium">
                      Formule : 📊{" "}
                      <strong>Σ(Note × Coefficient) / Σ(Coefficients)</strong>
                      {detailNotes.par_jury.length > 1 &&
                        " → puis moyenne entre les jurys"}
                    </p>
                  </div>
                </div>
              ) : hasAncienCommentaire ? (
                /* Ancien système — commentaire jury unique */
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Commentaire du jury
                  </p>
                  <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 relative">
                    <Quote
                      className="absolute -top-2.5 -left-1 text-orange-200"
                      size={24}
                      fill="currentColor"
                    />
                    <p className="text-slate-700 text-sm leading-relaxed italic pl-4">
                      "{commentJury}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Aucune évaluation encore */
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Scale size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">
                    Ce projet n'a pas encore été évalué par le jury.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 text-center border-t border-slate-100 shrink-0">
          <p className="text-[10px] text-slate-700 leading-relaxed">
            {isNoteFinale
              ? "Évaluation réalisée par le comité de jury selon les critères définis."
              : "Score calculé en temps réel selon les interactions sur ce projet."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
