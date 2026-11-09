"use client";

// Emplacement : app/components/ChallengeSkeleton.tsx
// Squelettes de cartes (même silhouette que ChallengeCard) avec balayage lumineux.

export function ChallengeSkeletonCards({ count = 8 }: { count?: number }) {
  return (
    <>
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
          background: linear-gradient(
            100deg,
            transparent 20%,
            rgba(255, 255, 255, 0.75) 50%,
            transparent 80%
          );
          transform: translateX(-100%);
          animation: ti-sweep 1.4s ease-in-out infinite;
          animation-delay: var(--d, 0s);
        }
        @media (prefers-reduced-motion: reduce) {
          .ti-skel-card::after { animation: none; }
        }
      `}</style>

      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card w-full max-w-xs rounded-xl border border-gray-200 bg-white"
          style={{ ["--d" as any]: `${(i % 4) * 0.15}s` }}
        >
          <div className="h-6 bg-gray-300" />
          <div className="h-32 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-4 w-11/12 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-4/5 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-gray-200" />
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="h-3 w-2/5 rounded bg-gray-200" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 flex-1 rounded-lg bg-gray-200" />
              <div className="h-8 flex-1 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
