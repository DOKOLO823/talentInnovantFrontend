import { Suspense } from "react";
import ProjectReelClient from "./ProjectReelClient";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://talentinnovant.com/api";

async function fetchChallengeDetails(challengeId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/challenge/details/${challengeId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function Page({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const challengeId = resolvedParams?.id;

  if (!challengeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-sm">
          <Trash2 size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Challenge introuvable</h2>
        <p className="text-slate-500 max-w-xs leading-relaxed mb-10">Ce challenge n'est plus disponible ou a été supprimé.</p>
        <Link 
          href="/home-talent"
          className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none"
        >
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const challengeData = await fetchChallengeDetails(challengeId);
  const challenge = challengeData?.data?.challenge || challengeData?.challenge;

  if (!challenge){
     return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-sm">
          <Trash2 size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Challenge introuvable</h2>
        <p className="text-slate-500 max-w-xs leading-relaxed mb-10">Ce challenge n'est plus disponible ou a été supprimé.</p>
        <Link 
          href="/home-talent"
          className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none"
        >
          <ArrowLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
     )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ProjectReelClient
        challenge={challenge}
        initialProjectId={resolvedSearchParams?.project}
      />
    </Suspense>
  );
}