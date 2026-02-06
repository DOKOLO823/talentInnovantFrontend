"use client";

import { MoreVertical, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ProjectCardPortfolio({
  data,
  onEdit,
  onDelete,
  isOwner
}: {
  data: any;
  onEdit: () => void;
  onDelete: () => void;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);

  // Split des technologies si c'est un string
  const techList = typeof data.technologie == 'string' 
    ? data.technologie.split(',').map((t: string) => t.trim()).filter((t: string) => t !== "")
    : data.technologie;

    // console.log(data)

  function ReadMore({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const limit = 150;
    if (!text) return null;
    return (
      <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
        {isOpen || text.length <= limit ? text : text.slice(0, limit) + "..."}
        {text.length > limit && (
          <button onClick={() => setIsOpen(!isOpen)} className="ml-1 text-orange-600 font-bold hover:underline lowercase">
            {isOpen ? "voir moins" : "voir plus"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 relative flex-1 min-w-[250px] max-w-[400px]">

      {/* MENU OPTIONS (3 points) */}
      <div className="absolute top-3 right-3 z-10">
        {isOwner && (
          <button onClick={() => setOpen(!open)} className="p-1 hover:bg-gray-100 rounded-full">
            <MoreVertical size={20} className="text-gray-700" />
          </button>
        )}

        {open && (
          <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-32 p-2 z-20">
            <div
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
            >
              Modifier
            </div>
            <div
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded cursor-pointer text-sm font-medium"
            >
              Supprimer
            </div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold"><ReadMore text={data.titre} /></h3>
      <div className="text-gray-600 text-sm mt-1 mb-1 line-clamp-1">{data.year}</div>
      <div className="mt-3 text-gray-700"><ReadMore text={data.description} /></div>

      {/* 1. Technologies - Bulles avec overflow-x */}
      <div className="flex flex-row overflow-x-auto gap-2 mt-4 no-scrollbar pb-1">
        {techList?.map((tech: string, index: number) => (
          <span
            key={index}
            className="text-[11px] bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-100 whitespace-nowrap font-medium"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* 2. Images avec clic pour agrandir */}
      {data.medias && data.medias.length > 0 && (
        <div className="flex flex-row overflow-x-auto gap-3 mt-4 no-scrollbar">
          {data.medias.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImgIndex(i)}
              className="rounded-lg w-4/5 h-64 object-cover shadow-sm cursor-pointer hover:opacity-95 transition-opacity flex-shrink-0"
              alt={`Projet ${data.titre}`}
            />
          ))}
        </div>
      )}

      {data.link && (
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-1.5 text-orange-700 hover:underline font-bold text-sm"
        >
          <ExternalLink size={16} /> Voir le projet
        </a>
      )}

      {/* MODAL LIGHTBOX (Zoom image) */}
      {selectedImgIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setSelectedImgIndex(null)}
            className="absolute top-6 right-6 text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
            {/* Image actuelle */}
            <img 
              src={data.medias[selectedImgIndex]} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300"
              alt="Zoom"
            />
          </div>

          {/* Indicateurs (petits cercles) */}
          <div className="flex gap-2 mt-8">
            {data.medias.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIndex(idx)}
                className={`h-2 transition-all rounded-full ${selectedImgIndex === idx ? 'w-8 bg-orange-600' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>

          {/* Navigation au clavier ou boutons (Optionnel mais recommandé) */}
          {data.medias.length > 1 && (
            <div className="absolute inset-x-4 flex justify-between pointer-events-none">
              <button 
                onClick={() => setSelectedImgIndex((selectedImgIndex - 1 + data.medias.length) % data.medias.length)}
                className="pointer-events-auto p-3 text-white bg-black/20 rounded-full hover:bg-black/40 transition"
              >
                <ChevronLeft size={30} />
              </button>
              <button 
                onClick={() => setSelectedImgIndex((selectedImgIndex + 1) % data.medias.length)}
                className="pointer-events-auto p-3 text-white bg-black/20 rounded-full hover:bg-black/40 transition"
              >
                <ChevronRight size={30} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}