import React from "react";
import {
  X,
  ThumbsUp,
  MessageSquare,
  Share2,
  BarChart3,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ScoreDetailModal({
  isOpen,
  onClose,
  data,
  isNoteFinale,
  commentJury,
}: any) {
  if (!isOpen) return null;

  const WEIGHTS = { VOTE: 2, SHARE: 4, COMMENT: 5 };

  const totalValue = isNoteFinale
    ? Number(data.value).toFixed(2)
    : Math.floor(data.value);

  // Calcul logique : Total - (votes + partages) = points réels des commentaires
  const votePoints = data.votes * WEIGHTS.VOTE;
  const sharePoints = data.shares * WEIGHTS.SHARE;
  const commentPoints = Math.max(
    0,
    Math.floor(data.value) - (votePoints + sharePoints),
  );

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden"
      >
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-slate-800 font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
            <BarChart3 className="w-4 h-4 text-orange-700" />
            Analyse du {isNoteFinale ? "Résultat" : "Score"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              {isNoteFinale ? "Note Finale" : "Total Cumulé"}
            </span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              {totalValue}
              <span className="text-orange-700 text-sm ml-1">
                {isNoteFinale ? "/20" : " pts"}
              </span>
            </div>
          </div>

          {!isNoteFinale && (
            <div className="space-y-3">
              <StatRow
                label="Vote(s)"
                count={data.votes}
                points={votePoints}
                icon={<ThumbsUp className="text-blue-600" size={14} />}
                color="bg-blue-50"
              />
              <StatRow
                label="Partage(s)"
                count={data.shares}
                points={sharePoints}
                icon={<Share2 className="text-green-600" size={14} />}
                color="bg-green-50"
              />
              <StatRow
                label="Commentaire(s)"
                count={data.comments}
                points={commentPoints}
                icon={<MessageSquare className="text-purple-600" size={14} />}
                color="bg-purple-50"
              />
            </div>
          )}

          {isNoteFinale && commentJury && (
            <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 relative">
              <Quote
                className="absolute -top-2 -left-1 text-orange-200"
                size={20}
                fill="currentColor"
              />
              <p className="text-[10px] font-black text-orange-800 uppercase mb-1.5 tracking-wider">
                Avis du Jury
              </p>
              <p className="text-slate-700 text-[15px] leading-relaxed italic">
                "{commentJury}"
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isNoteFinale
              ? "Ce résultat inclut l'évaluation finale du jury."
              : "Ce score est calculé en temps réel selon l'engagement ou interactions générées par ce post."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StatRow({ label, count, points, icon, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`${color} p-2 rounded-xl`}>{icon}</div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700">{label}</span>
          <span className="text-[9px] text-slate-500">{count}</span>
        </div>
      </div>
      <div className="font-black text-slate-900 text-sm">{points} pts</div>
    </div>
  );
}
