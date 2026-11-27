"use client";

// Emplacement : app/communaute/components/common/Skeletons.tsx
// Squelettes avec balayage lumineux (même effet que les autres pages).

import { SkeletonSweepStyles } from "@/app/components/TalentSkeleton";

export function PostSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      <SkeletonSweepStyles />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card bg-white border border-slate-200 rounded-2xl p-4"
          style={{ ["--d" as any]: `${i * 0.15}s` }}
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-1/4 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
          </div>
          <div className="mt-4 h-48 rounded-xl bg-slate-200" />
          <div className="mt-4 flex gap-3">
            <div className="h-8 flex-1 rounded-lg bg-slate-200" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <SkeletonSweepStyles />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden="true" className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
          <div
            className="ti-skel-card flex-1 rounded-2xl bg-slate-100 p-3 space-y-2"
            style={{ ["--d" as any]: `${i * 0.15}s` }}
          >
            <div className="h-3 w-1/4 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      <SkeletonSweepStyles />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card w-60 shrink-0 rounded-2xl border border-slate-200 bg-white p-5"
          style={{ ["--d" as any]: `${i * 0.15}s` }}
        >
          <div className="mx-auto h-20 w-20 rounded-full bg-slate-200" />
          <div className="mx-auto mt-4 h-4 w-3/4 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-3 w-1/2 rounded bg-slate-200" />
          <div className="mt-5 h-9 rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
