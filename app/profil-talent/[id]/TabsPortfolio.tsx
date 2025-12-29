"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, MoreVertical } from "lucide-react";

// IMPORTATION DES MODALS
import ModalAddProject from "@/app/components/portfolio/ModalAddProject";
import ModalEditProject from "@/app/components/portfolio/ModalEditProject";
import ModalDeleteProject from "@/app/components/portfolio/ModalDeleteProject";
import ModalSharePortfolio from "@/app/components/portfolio/ModalSharePortfolio";

/* ============================================================
   🔥 Fake Data pour tests
============================================================= */
const initialPortfolio = {
  id: 1,
  user: {
    name: "John Doe",
    profession: "Développeur Full-Stack",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  },
  projects: [
    {
      id: 1,
      titre: "Application de gestion scolaire",
      description:
        "Plateforme pour gérer élèves, professeurs et emplois du temps.",
      technologie: ["Laravel", "React", "MySQL"],
      year: 2024,
      link: "https://myproject.example.com",
      medias: [
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
        "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg",
      ],
    },
    {
      id: 2,
      titre: "Système de vote électronique",
      description:
        "Outil sécurisé permettant un vote anonyme chiffré.",
      technologie: ["Node.js", "Next.js", "PostgreSQL"],
      year: 2023,
      medias: [
        "https://images.pexels.com/photos/3861959/pexels-photo-3861959.jpeg",
      ],
    },
  ],
};

/* ============================================================
   📌 COMPONENT PRINCIPAL
============================================================= */
export default function TabsPortfolio() {
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);

  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  /* ===================== 🔥 AJOUT DE PROJET ====================== */
  const handleAdd = (data: any) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now(),
          ...data,
          technologie: data.technologie
            .split(",")
            .map((t: string) => t.trim()),
        },
      ],
    }));
    setAddOpen(false);
  };

  /* ===================== 🔥 MODIFIER PROJET ====================== */
  const handleEdit = (data: any) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectToEdit.id
          ? {
              ...p,
              ...data,
              technologie: data.technologie
                .split(",")
                .map((t: string) => t.trim()),
            }
          : p
      ),
    }));
    setEditOpen(false);
  };

  /* ===================== 🔥 SUPPRIMER PROJET ====================== */
  const handleDelete = () => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectToDelete.id),
    }));
    setDeleteOpen(false);
  };

  return (
    <div className="w-full">

      {/* ============================================================
          HEADER : PARTAGER & AJOUT
      =============================================================== */}
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
        <button
          onClick={() => setShareOpen(true)}
          className="bg-white text-orange-700 px-4 py-2 rounded-lg border border-orange-700 hover:bg-orange-50 transition"
        >
          Partager le portfolio
        </button>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-800"
        >
          <Plus size={18} /> Ajouter un projet
        </button>

        <Link
          href={`/portfolio/${portfolio.id}`}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition"
        >
          Voir seul
        </Link>
      </div>

      {/* ============================================================
          HERO SECTION
      =============================================================== */}
      <div className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <Image
          src={portfolio.user.avatar}
          width={120}
          height={120}
          alt="avatar"
          className="rounded-full object-cover border-4 border-white shadow-md"
        />

        <div>
          <p className="text-xl">Salut, je m'appelle</p>
          <h1 className="text-3xl font-bold">{portfolio.user.name}</h1>
          <p className="text-gray-600 text-lg">{portfolio.user.profession}</p>
        </div>
      </div>

      {/* ============================================================
          TITRE SECTION PROJETS
      =============================================================== */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
        Mes projets ({portfolio.projects.length})
      </h2>

      {/* ============================================================
          LISTE DES PROJETS
      =============================================================== */}
      <div className="flex flex-wrap gap-6 mb-12">
        {portfolio.projects.map((project) => (
          <ProjectCard
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
          />
        ))}
      </div>

      {/* =================== MODALS =================== */}
      {isAddOpen && (
        <ModalAddProject
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {isEditOpen && projectToEdit && (
        <ModalEditProject
          project={projectToEdit}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
        />
      )}

      {isDeleteOpen && projectToDelete && (
        <ModalDeleteProject
          project={projectToDelete}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {isShareOpen && (
        <ModalSharePortfolio
          link={`https://yourwebsite.com/portfolio/${portfolio.id}`}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

/* ============================================================
   🔥 CARD DE PROJET
============================================================= */
function ProjectCard({
  data,
  onEdit,
  onDelete,
}: {
  data: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 relative flex-1 min-w-[250px] max-w-[400px]">

      {/* MENU OPTIONS (3 points) */}
      <div className="absolute top-3 right-3">
        <button onClick={() => setOpen(!open)}>
          <MoreVertical size={20} className="text-gray-700" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-32 p-2">
            <div
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
               Modifier
            </div>

            <div
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded cursor-pointer"
            >
               Supprimer
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold">{data.titre}</h3>
      <p className="text-gray-600 text-sm mt-1">{data.year}</p>
      <p className="mt-3 text-gray-700">{data.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {data.technologie?.map((tech: string) => (
          <span
            key={tech}
            className="text-xs bg-gray-100 px-3 py-1 rounded-full border"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Images */}
      <div className="flex flex-row overflow-x-auto gap-3 mt-4">
        {data.medias?.map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            className="rounded-lg w-full h-64 object-cover shadow-sm"
          />
        ))}
      </div>

      {data.link && (
        <a
          href={data.link}
          target="_blank"
          className="mt-4 inline-block text-orange-700 hover:underline"
        >
          🔗 Voir le projet
        </a>
      )}
    </div>
  );
}
