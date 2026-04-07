import { Bot, Loader2 } from "lucide-react";

export const CoachBannerSkeleton = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Petit Loader discret au-dessus */}
      <div className="flex items-center gap-2 mb-4 animate-fade-in">
        <Loader2 size={16} className="animate-spin text-orange-700" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Chargement du coach virtuel...
        </span>
      </div>

      {/* Card Skeleton - Épouse la forme exacte du card réel */}
      <div className="w-full max-w-[calc(100%-2.5rem)] md:max-w-[calc(100%-14rem)] mx-auto md:px-32 bg-gray-50/50 border border-gray-100 border-l-4 border-l-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center gap-6 relative overflow-hidden animate-pulse">
        {/* Effet de vent (Shimmer) sur toute la carte */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />

        {/* Cercle Icone Skeleton */}
        <div className="relative w-16 h-16 bg-gray-200 rounded-full shrink-0 flex items-center justify-center">
          <Bot size={32} className="text-gray-300" />
        </div>

        {/* Texte Skeleton */}
        <div className="flex-1 space-y-3 w-full">
          <div className="h-5 bg-gray-200 rounded-md w-3/4 mx-auto" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded-md w-full" />
            <div className="h-3 bg-gray-200 rounded-md w-5/6 mx-auto md:mx-0" />
          </div>
        </div>

        {/* Bouton Skeleton */}
        <div className="shrink-0 w-full md:w-48 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};
