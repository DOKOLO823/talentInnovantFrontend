"use client";

import { useState, useEffect } from "react";
import { 
  Mail, Phone, ExternalLink, X, ChevronLeft, ChevronRight, 
  Layers, Sparkles, Code2 
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

export default function PortfolioClient({ userId }: { userId: string }) {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const fetchPortfolio = async () => {
    try {
      setLoadingPortfolio(true);
      const res = await apiFetch(`/talent/portfolio/${userId}`, { method: "GET" });
      
      if (res?.statut === 200) {
        const p = res.portfolio;
        const transformedPortfolio = {
          id: p.id || userId,
          user: {
            name: p.user?.talent?.nom || p.user?.name || "Talent",
            profession: p.user?.talent?.profession || "Innovateur",
            avatar: p.user?.pp ? `${apifile}/${p.user.pp}` : "/assets/images/pp2.png",
            email: p.user?.email,
            telephone: p.user?.telephone,
            bio: p.user?.bio || null,
            competences: p.user?.talent?.competence ? p.user.talent.competence.split(',') : []
          },
          projects: p.projects?.map((project: any) => ({
            ...project,
            medias: project.medias 
              ? (Array.isArray(project.medias) ? project.medias : JSON.parse(project.medias)).map((m: string) => `${apifile}/${m}`)
              : [],
            technologie: project.technologie 
              ? (typeof project.technologie === 'string' ? project.technologie.split(',') : project.technologie)
              : []
          })) || [],
        };
        setPortfolioData(transformedPortfolio);
      }
    } catch (error) {
      console.error("Erreur portfolio:", error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => { if (userId) fetchPortfolio(); }, [userId]);

  if (loadingPortfolio) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-700"></div>
      </div>
    );
  }

  if (!portfolioData) return <div className="text-center py-20 text-gray-500">Portfolio introuvable.</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      
      {/* SECTION HERO */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-28 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          
          <div className="shrink-0">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden ring-4 ring-orange-500/10">
              <img
                src={portfolioData?.user?.avatar}
                alt={portfolioData?.user?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="mb-6">
              <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-2">
                {portfolioData?.user?.name}
              </h1>
              <p className="text-2xl md:text-4xl font-bold text-orange-500 uppercase">
                {portfolioData?.user?.profession}
              </p>
            </div>

            {portfolioData.user.bio && (
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mb-8 font-medium">
                {portfolioData.user.bio}
              </p>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Compétences clés :</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {portfolioData.user.competences.map((skill: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="group flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-orange-600/20 hover:border-orange-500/50 transition-all duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200 tracking-wide">
                      {skill.trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="mb-10 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-flex">
          <Layers className="text-orange-700" size={24} />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Projets réalisés</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {portfolioData.projects.map((project: any) => (
            <ProjectCardInline key={project.id} data={project} />
          ))}
        </div>

        {/* SECTION CONTACT - OPTIMISÉE RESPONSIVE */}
        <section className="relative mt-20 mb-10 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] p-6 py-10 md:p-16 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative z-10 text-center md:text-left space-y-4 max-w-xl">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Prêt à lancer <br className="hidden md:block"/><span className="text-orange-600">votre projet ?</span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
                  Disponible pour de nouvelles opportunités. Transformons ensemble vos concepts en réalisations exceptionnelles.
                </p>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <a 
                  href={`mailto:${portfolioData.user.email}`} 
                  className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold transition-all hover:bg-orange-600 hover:shadow-lg active:scale-95"
                >
                  <Mail size={18} className="group-hover:scale-110 transition-transform" /> 
                  <span className="text-sm md:text-base">M'envoyer un message</span>
                </a>
                
                <a 
                  href={`tel:${portfolioData.user.telephone}`} 
                  className="flex items-center justify-center gap-3 bg-gray-50 text-slate-700 border border-gray-200 px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold transition-all hover:bg-white hover:border-orange-200 hover:text-orange-600 active:scale-95"
                >
                  <Phone size={18} /> 
                  <span className="text-sm md:text-base">{portfolioData.user.telephone}</span>
                </a>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium border-t border-gray-100 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Disponible pour collaboration
              </div>
              <p className="text-center font-bold uppercase tracking-widest text-[10px]">
                © {new Date().getFullYear()} • {portfolioData.user.name?.length > 35 ? portfolioData.user.name?.substr(0, 35) + '...' : portfolioData.user.name} • Portfolio Professionnel
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProjectCardInline({ data }: { data: any }) {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMedias = data.medias && data.medias.length > 0;

  useEffect(() => {
    if (!hasMedias || data.medias.length <= 1 || selectedImgIndex !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.medias.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [data.medias, hasMedias, selectedImgIndex]);

  function ReadMore({ text, isTitle = false }: { text: string; isTitle?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const limit = isTitle ? 50 : 120;
    if (!text) return null;
    return (
      <div className={`${isTitle ? "text-lg font-bold text-slate-900" : "text-slate-600 text-sm"} leading-relaxed`}>
        {isOpen || text.length <= limit ? text : text.slice(0, limit) + "..."}
        {text.length > limit && (
          <button onClick={() => setIsOpen(!isOpen)} className="ml-1 text-orange-600 font-bold hover:underline">
            {isOpen ? "voir moins" : "voir plus"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 group">
      
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {hasMedias ? (
          <>
            <div 
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {data.medias.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImgIndex(i)}
                  className="h-full w-full object-cover flex-shrink-0 cursor-pointer hover:brightness-90 transition"
                  alt={`${data.titre} - ${i}`}
                />
              ))}
            </div>

            {data.medias.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
                {data.medias.map((_: any, i: number) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 italic flex-col gap-2">
            <Code2 size={40} />
            <span className="text-xs">Aucun média</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
          {data.year}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <ReadMore text={data.titre} isTitle={true} />
        <div className="mt-3 flex-1">
          <ReadMore text={data.description} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4 mb-4">
          {data.technologie?.map((tech: string, index: number) => (
            <span key={index} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-semibold uppercase tracking-tighter">
              {tech.trim()}
            </span>
          ))}
        </div>

        {data.link && (
          <a href={data.link} target="_blank" className="mt-auto pt-4 border-t flex items-center gap-2 text-orange-700 font-bold text-sm group-hover:gap-3 transition-all">
            <ExternalLink size={16} /> Voir le projet
          </a>
        )}
      </div>

      {selectedImgIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4">
          <button onClick={() => setSelectedImgIndex(null)} className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X size={28} />
          </button>
          <div className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center">
            {data.medias.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setSelectedImgIndex((selectedImgIndex - 1 + data.medias.length) % data.medias.length); }} className="absolute left-0 z-10 p-4 text-white hover:text-orange-500 transition"><ChevronLeft size={48} /></button>
                <button onClick={(e) => { e.stopPropagation(); setSelectedImgIndex((selectedImgIndex + 1) % data.medias.length); }} className="absolute right-0 z-10 p-4 text-white hover:text-orange-500 transition"><ChevronRight size={48} /></button>
              </>
            )}
            <img src={data.medias[selectedImgIndex]} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300" alt="Fullscreen" />
          </div>
          <div className="flex gap-3 mt-10">
            {data.medias.map((_: any, idx: number) => (
              <button key={idx} onClick={(e) => { e.stopPropagation(); setSelectedImgIndex(idx); }} className={`h-2.5 rounded-full transition-all duration-300 ${selectedImgIndex === idx ? 'w-10 bg-orange-600' : 'w-2.5 bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}