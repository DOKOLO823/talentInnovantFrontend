import { X, AlertCircle } from "lucide-react";
import Link from "next/link"; // Importation de Link pour Next.js

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          {/* Icône */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>

          {/* Titre */}
          <h2 className="text-xl font-bold text-gray-900">Connexion requise</h2>
          
          {/* Message */}
          <p className="text-gray-600">
            Vous devez être connecté pour participer à ce challenge.
          </p>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/auth/register-talent"
              className="flex-1 py-2.5 text-center font-medium rounded-lg border border-orange-700 text-orange-700 hover:bg-orange-50 transition"
            >
              S&apos;inscrire
            </Link>
            
            <Link
              href="/auth/login"
              className="flex-1 py-2.5 text-center font-medium rounded-lg bg-orange-700 text-white hover:bg-orange-800 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}