"use client";
import { useState, useEffect } from "react";
import ProjectCardProfile from "@/app/components/cards/ProjectCardProfile";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

export default function TabsProjects({ projects, userId, onRefresh }: any) {
  const [projectsData, setProjectsData] = useState(projects || []);
  const [loading, setLoading] = useState(!projects || projects.length === 0);
  
  useEffect(() => {
    if (!projects || projects.length === 0) {
      fetchUserProjects();
    } else {
      setProjectsData(projects);
      setLoading(false);
    }
  }, [projects]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/talent/profil/${userId}`, { method: "GET" });
      
      if (res?.statut === 200) {
        const transformedProjects = res.posts_par_challenge?.flatMap((challengeGroup: any[]) => 
          challengeGroup.map((post: any) => ({
            id: post.id,
            rank: post.rang,
            author: {
              id: res?.user.id,
              name: res.talent?.nom || res.user.name || "Talent",
              role: res?.talent?.profession || "Innovateur",
              avatar: res?.user.pp 
                ? apifile + '/' + res?.user.pp
                : null,
            },
            challenge: {
              id: post.challenge_id,
              name: post.challenge?.titre || "Challenge",
              image: post.challenge?.photo 
                ? `${apifile}/storage/${post.challenge.photo}`
                : "../assets/images/award.jpg",
              typeevaluation: post.typeevaluation?.type,
              resultatdisponible: post.challenge?.resultatdisponible == 1 ? 1 : 0,
              datefin: post?.challenge?.datefin,
              portee: post?.challenge?.portee?.portee
            },
            responses: post.responses?.map((response: any) => ({
              id: response.id,
              challenge_field: {
                label: response.field?.label || "Champ",
                type: response.field?.type || "text",
              },
              value: response.value,
            })) || [],
            notefinale: post.notefinale,
            score:post.score,
            vote:post.like,
            partage:post.partage,
            idlikeurs:post?.likeurs_ids,
            nombreCommentaire:post?.nombreCommentaire
          }))
        ) || [];
        
        setProjectsData(transformedProjects);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  if (projectsData.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Aucun projet trouvé pour ce talent.</p>
        <button
          onClick={onRefresh}
          className="mt-4 bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800"
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4 mb-12">
      {projectsData.map((project: any) => (
        <ProjectCardProfile key={project.id} project={project} />
      ))}
    </div>
  );
}