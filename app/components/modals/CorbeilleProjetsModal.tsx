"use client";

import { X, Trash2, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCardToEvaluate from "../cards/ProjectCardToEvaluate";

export default function CorbeilleProjetsModal({
  isOpen,
  onClose,
  projects,
  challenge,
  onToggleCorbeille,
}: any) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                <Trash2 className="text-orange-700" size={20} />
              </div>
              <div>
                <h3 className="lg:text-lg text-sm font-black text-slate-900 tracking-tight leading-tight">
                  Corbeille des projets
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {projects?.length || 0} projet
                  {projects?.length > 1 ? "s" : ""} dans la corbeille
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-full transition-all shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Corps */}
          <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 bg-slate-50/40">
            {projects?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((p: any) => (
                  <ProjectCardToEvaluate
                    key={p.id}
                    project={p}
                    challenge={challenge}
                    isCorbeille
                    onToggleCorbeille={onToggleCorbeille}
                    onEvaluate={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-white border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="text-slate-300" size={28} />
                </div>
                <p className="font-bold text-slate-600 text-sm">
                  La corbeille est vide
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Les projets déplacés ici apparaîtront dans cette liste.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
