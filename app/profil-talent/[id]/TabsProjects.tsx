"use client";
import { useState, useEffect, useCallback } from "react";
import ProjectCardProfile from "@/app/components/cards/ProjectCardProfile";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { RefreshCcw, FolderOpen } from "lucide-react";

export default function TabsProjects({
  projects,
  userId,
  userInfos,
  onRefresh,
}: any) {
  const [projectsData, setProjectsData] = useState(projects || []);
  const [loading, setLoading] = useState(!projects || projects?.length === 0);
  const [activeTab, setActiveTab] = useState("entreprise"); // Filtre par défaut

  const fetchUserProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/talent/posts-projets/${userId}`, {
        method: "GET",
      });

      if (res?.statut === 200 && res.posts_par_challenge) {
        const transformedProjects = res?.posts_par_challenge?.flatMap(
          (challengeGroup: any) =>
            (Array.isArray(challengeGroup) ? challengeGroup : [])?.map(
              (post: any) => ({
                id: post.id,
                rank: post.rang,
                nombreposts: post.nombreposts,
                commentairejury: post.commentairejury,
                author: {
                  id: post.user?.id,
                  name: post.user?.name,
                  role: post.user?.profession,
                  avatar: post.user?.pp ? `${apifile}/${post.user.pp}` : null,
                },
                challenge: {
                  id: post.challenge_id,
                  name: post.challenge?.titre || "Challenge",
                  image: post.challenge?.photo
                    ? `${apifile}/${post.challenge.photo}`
                    : "/assets/images/award.jpg",
                  typeevaluation:
                    post.typeevaluation?.type ||
                    post.challenge?.typeevaluation?.type,
                  resultatdisponible:
                    post.challenge?.resultatdisponible == 1 ? 1 : 0,
                  datefin: post?.challenge?.datefin,
                  portee: post.portee?.portee || post.challenge?.portee?.portee,
                  // On récupère le type ici pour le filtrage
                  typechallenge: post.challenge?.typechallenge || "entreprise",
                },
                responses:
                  post.responses?.map((response: any) => ({
                    id: response.id,
                    challenge_field: {
                      label: response.field?.label || "Champ",
                      type: response.field?.type || "text",
                    },
                    value: response.value,
                  })) || [],
                notefinale: post.notefinale,
                score: post.score,
                vote: post.like,
                partage: post.partage,
                idlikeurs: post?.likeurs_ids,
                nombreCommentaire: post?.nombreCommentaire,
              }),
            ),
        );
        setProjectsData(transformedProjects);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!projects || projects?.length === 0) {
      if (userId) fetchUserProjects();
    } else {
      setProjectsData(projects);
      setLoading(false);
    }
  }, [projects, userId, fetchUserProjects]);

  // Filtrage des données selon l'onglet actif
  const filteredProjects = projectsData.filter(
    (p: any) => p.challenge.typechallenge === activeTab,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sélecteur de type de challenge */}
      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab("entreprise")}
          className={`pb-2 px-2 text-sm font-bold transition-all ${
            activeTab === "entreprise"
              ? "text-orange-700 border-b-2 border-orange-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Challenges Entreprises
        </button>
        <button
          onClick={() => setActiveTab("talent")}
          className={`pb-2 px-2 text-sm font-bold transition-all ${
            activeTab === "talent"
              ? "text-orange-700 border-b-2 border-orange-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Challenges Talents
        </button>
      </div>

      {/* Explication dynamique */}
      <h2 className="text-sm md:text-md text-gray-800 mb-8 border-l-4 border-orange-700 pl-3">
        {activeTab === "entreprise"
          ? "Projets issus des challenges créés par des entreprises :"
          : "Projets issus des challenges créés par les talents de la communauté :"}
      </h2>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProjects.map((project: any) => (
            <ProjectCardProfile key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <FolderOpen className="text-gray-300" size={40} />
          </div>
          <h3 className="text-gray-900 font-bold">Aucun projet trouvé</h3>
          <p className="text-gray-500 text-sm max-w-xs text-center mt-2">
            Il n'y a aucun projet enregistré pour la catégorie{" "}
            <span className="font-semibold text-orange-700">
              {activeTab === "entreprise" ? "Entreprise" : "Talent"}
            </span>{" "}
            pour le moment.
          </p>
          <button
            onClick={() => {
              if (onRefresh) onRefresh();
              fetchUserProjects();
            }}
            className="mt-6 flex items-center gap-2 bg-orange-700 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-800 transition-all shadow-lg shadow-orange-700/20 active:scale-95"
          >
            <RefreshCcw size={18} />
            Actualiser la liste
          </button>
        </div>
      )}
    </div>
  );
}
