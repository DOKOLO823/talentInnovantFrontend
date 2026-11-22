"use client";

// Emplacement : app/collaborateurs/components/CollaborationRequestModal.tsx
// Fenêtre « Nouvelle collaboration » partagée par la carte talent ET le profil.
// Même endpoint, mêmes messages qu'avant.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";

export default function CollaborationRequestModal({
  open,
  onClose,
  recipientId,
  name,
  avatarUrl,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  recipientId: number;
  name?: string;
  avatarUrl: string; // URL complète de la photo
  onSent?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSendRequest = async () => {
    if (!message.trim()) return toast.error("Le message est vide.");
    setSending(true);
    try {
      const res = await apiFetch("/reseau/collaborations/envoyer", {
        method: "POST",
        body: JSON.stringify({ recepteur_id: recipientId, message }),
      });
      if (res.statut === 200) {
        toast.success("Demande envoyée !");
        setMessage("");
        onClose();
        onSent?.();
      } else {
        toast.error(res.message || "Erreur");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  // Affichée dans <body> : jamais coupée par un conteneur parent (liste horizontale, etc.)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[710] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-[2rem] w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={22} />
            </button>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg mb-4 border-2 border-orange-100">
                  <img
                    src={avatarUrl}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nouvelle Collaboration
                </h2>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                  Envoyez un message à{" "}
                  <span className="text-orange-700">{name}</span>
                </p>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre projet et ce que vous attendez de cette collaboration..."
                className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none text-sm resize-none"
              />
              <button
                onClick={handleSendRequest}
                disabled={sending || !message.trim()}
                className="w-full mt-5 py-3.5 bg-orange-700 hover:bg-orange-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 transition"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} /> Envoyer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
