"use client";

// Emplacement : app/communaute/components/common/ModalShell.tsx
// Coque commune de toutes les fenêtres : fond, animation, fermeture (X, clic extérieur, Échap),
// blocage du défilement, affichage dans <body> (jamais coupé par un parent).

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function ModalShell({
  open,
  onClose,
  title,
  children,
  panelClassName = "sm:max-w-lg",
  zClass = "z-[800]",
  locked = false, // true : impossible de fermer (action en cours)
  bodyClassName = "overflow-y-auto",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  panelClassName?: string;
  zClass?: string;
  locked?: boolean;
  bodyClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !locked) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, locked]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 ${zClass} flex items-end sm:items-center justify-center sm:p-4`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !locked && onClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${panelClassName} bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden`}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  disabled={locked}
                  aria-label="Fermer"
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
