"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false 
}: ConfirmationModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative"
      >
        {/* Bouton fermer en haut à droite */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icône d'avertissement */}
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 mt-2">
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>

        {/* Textes */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Supprimer ce projet ?
        </h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
          Cette action est irréversible. Toutes les données et médias liés à ce projet seront définitivement effacés.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Supprimer"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}