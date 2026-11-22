"use client";

// Emplacement : app/components/TalentSkeleton.tsx
// Squelettes avec balayage lumineux (même effet que les cartes de challenges).

export function SkeletonSweepStyles() {
  return (
    <style>{`
      @keyframes ti-sweep {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .ti-skel-card { position: relative; overflow: hidden; }
      .ti-skel-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.75) 50%, transparent 80%);
        transform: translateX(-100%);
        animation: ti-sweep 1.4s ease-in-out infinite;
        animation-delay: var(--d, 0s);
      }
      @media (prefers-reduced-motion: reduce) {
        .ti-skel-card::after { animation: none; }
      }
    `}</style>
  );
}

// Silhouette de la carte talent (cover, avatar, lignes, bouton)
export function TalentSkeletonCards({ count = 8 }: { count?: number }) {
  return (
    <>
      <SkeletonSweepStyles />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card bg-white border border-slate-200 rounded-2xl"
          style={{ ["--d" as any]: `${(i % 4) * 0.15}s` }}
        >
          <div className="h-16 md:h-20 bg-slate-200" />
          <div className="px-3 md:px-4 pb-4 text-center">
            <div className="-mt-8 md:-mt-10 mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-slate-300 border-4 border-white" />
            <div className="mt-3 mx-auto h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 mx-auto h-3 w-1/2 rounded bg-slate-200" />
            <div className="mt-3 mx-auto h-3 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 flex justify-center gap-1.5">
              <div className="h-5 w-14 rounded-full bg-slate-200" />
              <div className="h-5 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="mt-5 h-9 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </>
  );
}
