"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ExternalLink, RefreshCw, ChevronLeft } from "lucide-react";

function ChallengeIframeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  const url = searchParams.get("url");

  if (!url) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">URL manquante</h2>
        <p className="text-gray-500 mb-4">Impossible de charger le challenge externe.</p>
        <button onClick={() => router.back()} className="text-orange-600 font-bold underline">Retourner sur la plateforme</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-screen w-screen overflow-hidden">
      {/* Barre de contrôle Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-2xl relative z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">Quitter le challenge</span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block text-center">
          <p className="text-[10px] uppercase tracking-widest text-orange-500 font-black">Mode Immersion</p>
          <p className="text-xs text-slate-300 truncate max-w-xs italic">{url}</p>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
          >
            <ExternalLink size={14} /> 
            <span className="hidden sm:inline">Ouvrir hors cadre</span>
          </a>
        </div>
      </div>

      {/* Conteneur de l'Iframe */}
      <div className="flex-1 relative bg-slate-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <RefreshCw className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium animate-pulse">Chargement du challenge externe...</p>
          </div>
        )}
        <iframe 
          src={url} 
          className="w-full h-full border-none shadow-inner"
          onLoad={() => setLoading(false)}
          title="Challenge Externe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}

export default function ExternalChallengePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-orange-600" /></div>}>
      <ChallengeIframeContent />
    </Suspense>
  );
}