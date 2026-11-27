"use client";

// Page de détail d'un projet : accessible aux invités (lecture seule), avec bouton Retour.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import PostDetailView from "../../components/comments/PostDetailView";
import { PostSkeleton } from "../../components/common/Skeletons";
import type { Post } from "../../lib/Types";

export default function PostDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<"ok" | "notfound" | "error">("ok");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/communaute/posts/${id}`, { method: "GET" });
      if (res?.statut === 200) {
        setPost(res.data);
        setState("ok");
      } else {
        setState(res?.statut === 404 ? "notfound" : "error");
      }
    } catch {
      setState("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="mx-auto max-w-[680px] px-0 pt-4 sm:px-4">
        <div className="ml-4 sm:ml-1">
          <BackButton />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="px-3 sm:px-0">
              <PostSkeleton count={1} />
            </div>
          ) : state === "notfound" ? (
            <p className="py-20 text-center text-slate-500">
              Ce projet n'existe plus ou a été supprimé.
            </p>
          ) : state === "error" || !post ? (
            <div className="py-20 text-center">
              <p className="mb-4 text-sm text-slate-500">
                Impossible de charger ce projet.
              </p>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-800"
              >
                <RotateCcw size={16} /> Réessayer
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-2xl sm:border sm:border-slate-200">
              <PostDetailView
                post={post}
                onUpdate={(patch) =>
                  setPost((p) => (p ? { ...p, ...patch } : p))
                }
                onDeleted={() => router.replace("/communaute")}
                composerOffsetClass="bottom-[4.5rem] md:bottom-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
