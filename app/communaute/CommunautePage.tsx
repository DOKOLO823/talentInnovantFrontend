// app/communaute/CommunautePage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { startProgressToast } from "./lib/notify";
import BackButton from "@/app/components/BackButton";
import BackToTop from "@/app/components/BackToTop";
import { useAuth } from "@/app/context/AuthContext";
import Avatar from "./components/common/Avatar";
import AddPostModal from "./components/AddPostModal";
import FloatingAddButton from "./components/FloatingAddButton";
import TopTalentsRow from "./components/TopTalentsRow";
import TopEntreprisesRow from "./components/TopEntreprisesRow";
import Feed, { type FeedHandle } from "./components/Feed";
import { createPost, type NewPostData } from "./lib/postsApi";
import { Toaster } from "react-hot-toast";

export default function CommunautePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const feedRef = useRef<FeedHandle>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/home");
  }, [authLoading, user, router]);

  // Envoi en arrière-plan : la fenêtre est déjà fermée, l'utilisateur peut continuer à utiliser la page
  // Envoi en arrière-plan : la fenêtre est déjà fermée, l'utilisateur peut continuer à naviguer.
  // Le message de succès n'apparaît qu'après la réponse positive du serveur.
  const handleSubmitPost = async (data: NewPostData) => {
    const progress = startProgressToast("publish");
    const avertir = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avertir); // évite de perdre un envoi en fermant l'onglet
    try {
      const post = await createPost(data, progress.update);
      feedRef.current?.prepend(post);
      progress.success(post.id);
    } catch (e: any) {
      progress.error(e?.message || "Impossible de publier le projet.", () =>
        handleSubmitPost(data),
      );
    } finally {
      window.removeEventListener("beforeunload", avertir);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-32">
      <div className="mx-auto max-w-[680px] px-3 pt-4 sm:px-4">
        <div className="ml-1">
          <BackButton />
        </div>

        <header className="mb-5 mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Communauté
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 md:text-base">
            Découvrez les talents et entreprises les plus actifs, partagez vos
            projets et échangez avec les membres de TALENT INNOVANT.
          </p>
        </header>

        <div className="space-y-5">
          {/* Ajouter un projet */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-slate-600">
              Vous travaillez sur un projet ? Partagez-le avec la communauté
              pour recevoir des avis, des encouragements et trouver des
              collaborateurs.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar pp={user?.pp} name={user?.name} size={44} />
              <button
                onClick={() => setAddOpen(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-800 active:scale-[0.98]"
              >
                <Plus size={18} /> Partager un projet
              </button>
            </div>
          </section>

          <TopTalentsRow />
          <TopEntreprisesRow />

          <Feed ref={feedRef} onAddClick={() => setAddOpen(true)} />
        </div>
      </div>

      <FloatingAddButton onClick={() => setAddOpen(true)} />
      <BackToTop />

      <AddPostModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleSubmitPost}
      />
      <Toaster />
    </div>
  );
}
