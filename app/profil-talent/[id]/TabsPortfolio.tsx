"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, MoreVertical, Mail, Phone } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

// IMPORTATION DES MODALS
import ModalAddProject from "@/app/components/portfolio/ModalAddProject";
import ModalEditProject from "@/app/components/portfolio/ModalEditProject";
import ModalDeleteProject from "@/app/components/portfolio/ModalDeleteProject";
import ModalSharePortfolio from "@/app/components/portfolio/ModalSharePortfolio";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import ProjectCardPortfolio from "@/app/components/cards/ProjectCardPortfolio";

/* ============================================================
   📌 COMPONENT PRINCIPAL
============================================================= */
export default function TabsPortfolio({ portfolio, setPortfolio, userId, userData, currentUser}: any) {
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(!portfolio?.projects);
  const [loadingPortfolio, setLoadingPortfolio]=useState(false)
  const [portfolioData, setPortfolioData] = useState<any>(null);

  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const isOwner = currentUser?.id == userId;
  // console.log(userData)

   const fetchPortfolio = async () => {
      try {
        setLoading(false);
        setLoadingPortfolio(true)
        const res = await apiFetch(`/talent/portfolio/${userId}`, { method: "GET" });
        // console.log(res)
        
        if (res?.statut === 200) {
          const transformedPortfolio = {
            id: res.portfolio.id || userId,
            user: {
              name: res.portfolio.user?.talent?.nom || res.portfolio.user?.name || "Talent",
              profession: res.portfolio.user?.talent?.profession || "Innovateur",
              avatar: res.portfolio.user?.pp 
                ? `${apifile}/${res.portfolio.user.pp}`
                : "../assets/images/pp2.png",
            },
            email: res.portfolio.user?.email,
            phone: res.portfolio.user?.telephone,
            projects: res.portfolio.projects?.map((project: any) => ({
              id: project.id,
              titre: project.titre,
              description: project.description,
              technologie: project.technologie,
              year: project.year,
              link: project.link,
              medias: project.medias 
                ? (Array.isArray(project.medias) 
                    ? project.medias.map((media: string) => `${apifile}/${media}`)
                    : JSON.parse(project.medias).map((media: string) => `${apifile}/${media}`))
                : [],
              created_at: project.created_at,
            })) || [],
          };
          
          setPortfolioData(transformedPortfolio);
        } else {
          // Si pas de portfolio, créer un objet vide
          setPortfolioData({
            id: userId,
            user: {
              name: userData?.name || "Talent",
              profession: userData?.profession || "Innovateur",
              avatar: userData?.avatar || "../assets/images/pp2.png",
            },
            projects: [],
          });

          // if(res?.message) toast.error(res?.message)
        }
        setLoadingPortfolio(false)
      } catch (error) {
        // console.error("Erreur lors du chargement du portfolio:", error);
        // Ne pas bloquer l'affichage si le portfolio échoue
        setLoadingPortfolio(false)
        setPortfolioData({
          id: userId,
          user: {
            name: userData?.name || "Talent",
            profession: userData?.profession || "Innovateur",
            avatar: userData?.avatar || "../assets/images/pp2.png",
          },
          projects: [],
        });
      }
    };

  // Initialiser portfolio si non défini
  useEffect(() => {
    fetchPortfolio();
    // if (!portfolio) {
    //   const defaultPortfolio = {
    //     id: userId,
    //     user: {
    //       name: userData?.name || "Utilisateur",
    //       profession: userData?.profession || "Non spécifié",
    //       avatar: userData?.avatar || "/default-avatar.jpg",
    //     },
    //     projects: [],
    //   };
    //   setPortfolio(defaultPortfolio);
    //   setLoading(false);
    // } else if (portfolio && !portfolio.projects) {
    //   setPortfolio({
    //     ...portfolio,
    //     projects: [],
    //   });
    //   
    // }
  }, [portfolio, userId, userData]);

  /* ===================== 🔥 AJOUT DE PROJET ====================== */
  const handleAdd = async (data: any) => {
    try {
      setLoadingPortfolio(true);
      
      const formData = new FormData();
      formData.append('titre', data.titre);
      formData.append('description', data.description || '');
      formData.append('technologie', data?.technologie);
      formData.append('year', data.year);
      formData.append('link', data.link || '');
      
      if (data.medias && data.medias.length > 0) {
        data.medias.forEach((file: File) => {
          formData.append('medias[]', file);
        });
      }

      const res = await apiFetch(`/talent/portfolio/project`, {
        method: "POST",
        body: formData,
      });

      // console.log(res?.message)

      if (res?.statut == 200) {
        // Rafraîchir les données du portfolio
        if (fetchPortfolio) {
          await fetchPortfolio();
        } else {
          // Ajouter le nouveau projet au portfolio local
          const newProject = {
            id: res.project.id,
            titre: data.titre,
            description: data.description,
             technologie: data?.technologie,
            // technologie: data.technologie.split(',').map((t: string) => t.trim()),
            year: data.year,
            link: data.link,
            medias: data.mediasPreview || [],
            created_at: new Date().toISOString(),
          };

          setPortfolio((prev: any) => ({
            ...prev,
            projects: [...(prev.projects || []), newProject],
          }));
        }
        
        setAddOpen(false);
        toast.success("Projet ajouté avec succès");
      } else {
        toast.error(res?.message || "Erreur lors de l'ajout du projet",{duration:6000});
      }
    } catch (error) {
       console.error("Erreur lors de l'ajout du projet:", error);
      toast.error("Une erreur est survenue lors de l'ajout du projet");
    } finally {
      setLoadingPortfolio(false);
    }
  };

  /* ===================== 🔥 MODIFIER PROJET ====================== */
  const handleEdit = async (data: any) => {
  try {
    setLoadingPortfolio(true);
    const formData = new FormData();
    formData.append('titre', data.titre);
    formData.append('description', data.description || '');
    formData.append('technologie', data.technologie || '');
    formData.append('year', data.year);
    formData.append('link', data.link || '');
    
    // Si data.medias contient les Files envoyés par le modal
    if (data.medias && data.medias.length > 0) {
      data.medias.forEach((file: any) => {
        if (file instanceof File) {
          formData.append('medias[]', file); // Notez le [] pour matcher le backend
        }
      });
    }

      const res = await apiFetch(`/talent/portfolio/project/update/${projectToEdit.id}`, {
        method: "POST",
        body: formData,
      });

      if (res?.statut === 200) {
        // Rafraîchir les données
        if (fetchPortfolio) {
          await fetchPortfolio();
        } else {
          // Mettre à jour localement
          setPortfolio((prev: any) => ({
            ...prev,
            projects: (prev.projects || []).map((p: any) =>
              p.id === projectToEdit.id
                ? {
                    ...p,
                    titre: data.titre,
                    description: data.description,
                     technologie: data.technologie,
                    // technologie: data.technologie.split(',').map((t: string) => t.trim()),
                    year: data.year,
                    link: data.link,
                    medias: data.mediasPreview || p.medias,
                  }
                : p
            ),
          }));
        }
        
        setEditOpen(false);
        toast.success("Projet mis à jour avec succès");
      } else {
        toast.error(res?.message || "Erreur lors de la modification du projet");
      }
    } catch (error) {
      // console.error("Erreur lors de la modification du projet:", error);
      toast.error("Une erreur est survenue lors de la modification du projet");
    } finally {
      setLoadingPortfolio(false);
    }
  };

  /* ===================== 🔥 SUPPRIMER PROJET ====================== */
  const handleDelete = async () => {
    try {
      setLoadingPortfolio(true);
      
      const res = await apiFetch(`/talent/portfolio/project/delete/${projectToDelete.id}`, {
        method: "GET",
      });

      if (res?.statut === 200) {
        // Rafraîchir les données
        if (fetchPortfolio) {
          await fetchPortfolio();
        } else {
          // Supprimer localement
          setPortfolio((prev: any) => ({
            ...prev,
            projects: (prev.projects || []).filter((p: any) => p.id !== projectToDelete.id),
          }));
        }
        
        setDeleteOpen(false);
        toast.success("Projet supprimé avec succès");
      } else {
        toast.error(res?.message || "Erreur lors de la suppression du projet");
      }
    } catch (error) {
      // console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Une erreur est survenue lors de la suppression du projet");
    } finally {
      setLoadingPortfolio(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toaster/>
      {/* ============================================================
          HEADER : PARTAGER & AJOUT
      =============================================================== */}
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
       {isOwner &&  <button
          onClick={() => setShareOpen(true)}
          className="bg-white text-orange-700 px-4 py-2 rounded-lg border border-orange-700 hover:bg-orange-50 transition"
        >
          Partager le portfolio
        </button>}

       {!loadingPortfolio &&  <Link
          href={`/portfolio/${userId}`}
          className=" px-4 py-2 rounded-lg bg-orange-700 text-white border border-orange-700 hover:bg-orange-50 hover:text-orange-700 transition"
        >
          Aperçu
        </Link>}

      </div>

      {/* ============================================================
          HERO SECTION
      =============================================================== */}
        {
        !loadingPortfolio ? <>
      <div className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <Image
          src={portfolioData?.user?.avatar || "../assets/images/pp2.png"}
          width={120}
          height={120}
          alt="avatar"
          className="rounded-full object-cover border-4 h-24 w-24 border-white shadow-md"
        />

        <div className="flex flex-col items-center">
          <p className="text-[18px]">Salut, je m'appelle</p>
          <h1 className="text-2xl font-bold line-clamp-1">{portfolioData?.user?.name || "Talent"}</h1>
          <p className="text-gray-600 text-lg line-clamp-1">{portfolioData?.user?.profession || "Innovateur"}</p>
        </div>
      </div>

      {/* ============================================================
          TITRE SECTION PROJETS
      =============================================================== */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
         Mes projets ({!loadingPortfolio ? portfolioData?.projects?.length : '...'})
      </h2>
{ !(!portfolioData?.projects || portfolioData?.projects?.length === 0) && 
       isOwner && 
        (<button
          onClick={() => setAddOpen(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-700 text-white px-4 py-2 mb-6 rounded-lg hover:bg-orange-800 disabled:opacity-50"
        >
          <Plus size={18} /> Ajouter un projet
        </button>)


        }

        </> : '' }

        

      {/* ============================================================
          LISTE DES PROJETS
      =============================================================== */}
      {
        !loadingPortfolio ? 
        (!portfolioData?.projects || portfolioData?.projects?.length == 0 ) ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucun projet dans le portfolio.</p>
         {isOwner && 
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 flex items-center gap-2 bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800"
          >
            <Plus size={18} /> Ajouter votre premier projet
          </button>}

        </div>
      ) : (
       <div className="w-full h-full flex flex-col items-center">
         <div className="grid sm:grid-cols-1 gap-6 mb-12 md:grid md:grid-cols-2 lg:grid-cols-3">
          {portfolioData?.projects?.map((project: any) => (
            <ProjectCardPortfolio
              key={project.id}
              data={project}
              onEdit={() => {
                setProjectToEdit(project);
                setEditOpen(true);
              }}
              onDelete={() => {
                setProjectToDelete(project);
                setDeleteOpen(true);
              }}
              isOwner={isOwner}
            />
          ))}


        </div>

          {/* SECTION CONTACT */}
        <section className="relative mt-3 mb-10 overflow-hidden w-full">
  <div className="max-w-7xl mx-auto">
    <div className="relative bg-white border border-gray-100 rounded-[3rem] p-3 py-6 md:p-16 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden">
      
      {/* Element de design subtil en arrière-plan */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative z-10 text-center md:text-left space-y-4 max-w-xl">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Prêt à lancer <span className="text-orange-600">votre projet ?</span>
        </h2>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Disponible pour de nouvelles opportunités. Transformons ensemble vos concepts en réalisations exceptionnelles.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <a 
          href={`mailto:${portfolioData.email}`} 
          className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200"
        >
          <Mail size={20} className="group-hover:scale-110 transition-transform" /> 
          <span>M'envoyer un message</span>
        </a>
        
        <a 
          href={`tel:${portfolioData.phone}`} 
          className="flex items-center justify-center gap-3 bg-gray-50 text-slate-700 border border-gray-200 px-8 py-5 rounded-2xl font-bold transition-all hover:bg-white hover:border-orange-200 hover:text-orange-600"
        >
          <Phone size={20} /> 
          <span>{portfolioData?.phone}</span>
        </a>
      </div>
    </div>

    {/* Copyright simple en bas */}
    <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium border-t border-gray-100 pt-8">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Disponible pour collaboration
      </div>
      <p className="text-center">© {new Date().getFullYear()} • {portfolioData.user.name?.length>35 ? portfolioData.user.name?.substr(0,35)+'...' : portfolioData.user.name} • Portfolio Professionnel</p>
    </div>
  </div>
</section>

       </div>
      )

      : <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
      </div>

      }

      {/* =================== MODALS =================== */}
      {isAddOpen && (
        <ModalAddProject
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
          loading={loadingPortfolio}
        />
      )}

      {isEditOpen && projectToEdit && (
        <ModalEditProject
          project={projectToEdit}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
         loading={loadingPortfolio}
        />
      )}

      {isDeleteOpen && projectToDelete && (
        <ModalDeleteProject
          project={projectToDelete}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={loadingPortfolio}
        />
      )}

      {isShareOpen && (
        <ModalSharePortfolio
          link={`${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio?.id || userId}`}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

