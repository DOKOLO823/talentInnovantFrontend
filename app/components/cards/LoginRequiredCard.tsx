"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

interface LoginRequiredCardProps {
  title?: string;
  description?: string;
}

const LoginRequiredCard = ({
  title = "Connexion requise",
  description = "Connectez-vous pour accéder à cette fonctionnalité, interagir avec la communauté et profiter pleinement de toutes les opportunités de la plateforme.",
}: LoginRequiredCardProps) => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4 mt-16">
      <div className="bg-white rounded-[2.5rem] shadow-xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="p-8 md:p-10 text-center">
          {/* Icône de verrouillage/connexion */}
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-orange-600" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
            {title}
          </h3>

          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {description}
          </p>

          <div className="space-y-4">
            {/* Bouton de connexion principal */}
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-4 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
            >
              Se connecter
            </Link>

            {/* Bouton d'inscription secondaire */}
            <Link
              href="/auth/register-talent"
              className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-slate-100 hover:border-orange-200 hover:text-orange-700 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-5 h-5" />
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredCard;
