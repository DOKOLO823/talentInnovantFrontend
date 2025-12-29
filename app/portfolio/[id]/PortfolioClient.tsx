"use client";

import { useState } from "react";
import Image from "next/image";

interface PortfolioClientProps {
  portfolio: any;
}

export default function PortfolioClient({ portfolio }: PortfolioClientProps) {
  const [projects] = useState(portfolio.projects);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* HERO SECTION - Améliorée et professionnelle */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-700 to-red-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* Photo de profil */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30"></div>
              <Image
                src={portfolio.user.avatar}
                width={200}
                height={200}
                alt="avatar"
                className="relative rounded-full object-cover border-8 border-white shadow-2xl"
              />
            </div>

            {/* Informations */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-lg md:text-xl font-light tracking-wide mb-2 text-orange-100">
                Bonjour, je suis
              </p>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                {portfolio.user.name}
              </h1>
              <p className="text-2xl md:text-3xl font-light text-orange-50 mb-6">
                {portfolio.user.profession}
              </p>
              <div className="h-1 w-24 bg-white rounded-full mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION PROJETS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mes Projets
          </h2>
          <p className="text-lg text-gray-600">
            {projects.length} {projects.length > 1 ? 'projets réalisés' : 'projet réalisé'}
          </p>
        </div>

        {/* Grid de projets - Row sur PC, wrappable */}
        <div className="flex flex-wrap gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} data={project} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   🔥 CARD DE PROJET - Sans options de modification
============================================================= */
function ProjectCard({ data }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex-1 min-w-[250px] max-w-[400px]">
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.titre}</h3>
      <p className="text-orange-600 font-semibold text-sm mb-4">{data.year}</p>
      <p className="text-gray-700 leading-relaxed mb-5">{data.description}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-5">
        {data.technologie?.map((tech: string) => (
          <span 
            key={tech} 
            className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Medias */}
      {data.medias && data.medias.length > 0 && (
        <div className="flex flex-row overflow-x-auto gap-3 mb-5">
          {data.medias.map((img: string, i: number) => (
            <img 
              key={i} 
              src={img} 
              alt={`${data.titre} - image ${i + 1}`}
              className="rounded-lg w-full h-64 object-cover shadow-md hover:scale-105 transition-transform duration-200" 
            />
          ))}
        </div>
      )}

      {/* Lien du projet */}
      {data.link && (
        <a 
          href={data.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-orange-700 font-semibold hover:text-orange-800 hover:gap-3 transition-all"
        >
          <span>🔗</span>
          <span>Voir le projet</span>
        </a>
      )}
    </div>
  );
}