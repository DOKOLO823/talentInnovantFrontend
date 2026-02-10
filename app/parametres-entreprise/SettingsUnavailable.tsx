"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Construction, ArrowLeft, ShieldAlert, Timer } from 'lucide-react';

export default function SettingsUnavailable() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto px-6 text-center mt-28">
      {/* Illustration Iconographique */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-slate-100 rounded-full scale-[2] opacity-50" />
        <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-xl border border-slate-100">
          <Construction size={48} className="text-slate-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-orange-700 text-white p-1.5 rounded-lg shadow-lg">
            <ShieldAlert size={16} />
          </div>
        </div>
      </div>

      {/* Contenu Textuel */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Module en cours de configuration
        </h2>
        <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
          L'accès aux paramètres de l'entreprise est temporairement restreint. 
          Nos administrateurs finalisent actuellement la mise à jour de cette section pour garantir la sécurité de vos données.
        </p>
      </div>

      {/* Badge de statut */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-amber-700 text-xs font-semibold uppercase tracking-wider">
        <Timer size={14} />
        Déploiement en cours
      </div>

      {/* Actions */}
      <div className="mt-10 pt-10 border-t border-slate-100 w-full">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 mx-auto px-5 py-2.5 text-slate-600 hover:text-orange-700 font-semibold transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retourner à la page précédente
        </button>
      </div>
    </div>
  );
}