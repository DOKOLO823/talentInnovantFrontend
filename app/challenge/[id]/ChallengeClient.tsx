"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Pencil,
  Trash,
  Globe,
  ArrowUp,
  Heart,
  X,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProjectCard from "@/app/components/cards/ProjectCard";
import Navbar from "@/app/components/Navbar";
import { FakeProject } from "@/app/datas/ProjectList";
import { Facebook, MessageSquare } from "lucide-react";
import ProjectCardResult from "@/app/components/cards/ProjectCardResult";
import BackButton from "@/app/components/BackButton";
import EvaluateProjectModal from "@/app/components/modals/EvaluateProjectModal";
import ProjectCardToEvaluate from "@/app/components/cards/ProjectCardToEvaluate";
import { ProjectToEvaluate } from "@/app/datas/ProjectToEvaluate";
import { ProjectEvaluate } from "@/app/datas/ProjectEvaluate";
import { MyProjectByChallenge } from "@/app/datas/MyProjectByChallenge";
import { MostPopularProject } from "@/app/datas/MostPopularProject";

/**
 * Modal pour le partage sur les réseaux sociaux.
 */
function ShareModal({ challengeUrl, onClose }: any) {
  const shareLink = encodeURIComponent(challengeUrl);
  const shareText = encodeURIComponent("Découvrez ce super challenge !");
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${shareLink}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`;

  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: facebookUrl, color: "text-blue-600" },
    { name: "WhatsApp", icon: MessageSquare, url: whatsappUrl, color: "text-green-500" },
  ];

  const handleShare = (url: string) => {
    window.open(url, "_blank");
    onClose();
  };

  return (
    <ModalBase title="Partager le challenge" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-600 font-medium">Partager sur :</p>
        {socialLinks.map((social) => (
          <button
            key={social.name}
            onClick={() => handleShare(social.url)}
            className="flex items-center w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <social.icon size={24} className={social.color} />
            <span className="ml-3 font-semibold text-gray-800">{social.name}</span>
            <span className="ml-auto text-sm text-gray-500">(Cliquez pour partager)</span>
          </button>
        ))}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">Lien du challenge :</p>
          <div className="bg-gray-100 p-2 rounded-lg text-sm truncate">{challengeUrl}</div>
        </div>
      </div>
    </ModalBase>
  );
}

function DeleteConfirmModal({ challengeTitle, onConfirm, onCancel }: any) {
  return (
    <ModalBase title="Confirmer la suppression" onClose={onCancel}>
      <div className="p-4 text-center">
        <Trash size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-4">
          Êtes-vous sûr de vouloir supprimer le challenge <span className="font-bold">"{challengeTitle}"</span> ?
        </p>
        <p className="text-gray-600 mb-6">Cette action est irréversible. Toutes les données associées seront perdues.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md">
            Supprimer
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

function ModalBase({ children, title, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors p-1"><X size={24} /></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

export default function ChallengeClient({ challenge }: any) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const challengeUrl = "http://localhost:3000/challenge/2";

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNavbar(window.scrollY < lastScrollY);
      } else {
        setShowNavbar(true);
      }
      setShowBackToTop(window.scrollY > 300);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const tabs = [
    { id: "evaluate", label: "Évaluer les projets" },
    { id: "overview", label: "Aperçu" },
    { id: "projects", label: "Projets" },
    { id: "rules", label: "Règles" },
    { id: "criteria", label: "Critères" },
    { id: "rewards", label: "Récompenses" },
    { id: "participants", label: "Participants" },
    { id: "results", label: "Résultats" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <motion.div className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300" animate={{ y: showNavbar ? 0 : -100 }}>
        <Navbar />
      </motion.div>

      <BackButton m={16} />

      <div className="relative w-full h-64 md:h-80 rounded-b-2xl overflow-hidden shadow mt-6">
        <Image src={challenge.image} alt="Cover" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">{challenge.title}</h1>
          <p className="opacity-80 mt-1">{challenge.description}</p>
        </div>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4 px-6 mt-4">
        <button className="bg-orange-700 hover:bg-orange-800 text-white md:px-6 md:py-2 px-3 py-1 rounded-lg shadow">Participer</button>
        <button onClick={handleLike} className={`px-2 py-1 rounded-lg flex items-center gap-2 transition-colors ${isLiked ? "bg-orange-700 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
          <Heart size={18} fill={isLiked ? "white" : "none"} />
          <span className="font-semibold">{likesCount}</span>
        </button>
        <button onClick={() => setShowShareModal(true)} className="border border-gray-300 px-2 py-1 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-100 transition-colors">
          <Share2 size={18} /> Partager
        </button>
        <div className="ml-auto flex gap-3">
          <button className="text-gray-700 hover:text-orange-700 flex items-center gap-1"><Pencil size={18} /> Modifier</button>
          <button onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-700 flex items-center gap-1"><Trash size={18} /> Supprimer</button>
        </div>
      </div>

      <div className="sticky top-0 bg-white z-[40] mt-10 border-b">
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-3 whitespace-nowrap font-medium border-b-2 transition ${activeTab === t.id ? "border-orange-700 text-orange-700" : "border-transparent text-gray-600 hover:text-black"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 px-3">
        {activeTab === "evaluate" && <EvaluateProjectsSection challenge={challenge}  />}
        {activeTab === "overview" && <OverviewSection challenge={challenge} />}
        {activeTab === "projects" && <ProjectsSection challenge={challenge} />}
        {activeTab === "rules" && <RulesSection />}
        {activeTab === "criteria" && <CriteriaSection />}
        {activeTab === "rewards" && <RewardsSection />}
        {activeTab === "participants" && <ParticipantsSection />}
        {activeTab === "results" && <ResultsSection fakeProjects={ProjectEvaluate} challenge={challenge}  />}
      </div>

      {showBackToTop && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={scrollToTop} className="fixed bottom-10 right-5 z-50 p-3 bg-orange-700 text-white rounded-full shadow-lg"><ArrowUp className="w-4 h-4" /></motion.button>
      )}

      {showShareModal && <ShareModal challengeUrl={challengeUrl} onClose={() => setShowShareModal(false)} />}
      {showDeleteModal && <DeleteConfirmModal challengeTitle={challenge.title} onCancel={() => setShowDeleteModal(false)} onConfirm={() => setShowDeleteModal(false)} />}
    </div>
  );
}

function EvaluateProjectsSection({ challenge }: any) {
  const [activeSubTab, setActiveSubTab] = useState("liste");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const tabs = [
    { id: "liste", label: "À évaluer" },
    { id: "provisoire", label: "Résultats provisoires" },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER AVEC TABS BULLES ET BOUTON PUBLIER */}
      <div className="sticky top-[52px] bg-gray-50/80 backdrop-blur-md z-[30] -mx-3 px-3 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-5 py-1 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-300 ${
                  activeSubTab === tab.id
                    ? "bg-orange-700 text-white shadow-lg shadow-orange-700/20"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeSubTab === "provisoire" && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => alert("Résultats publiés")}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full shadow-lg transition-all font-bold text-sm"
            >
              <Send size={16} /> Publier les résultats
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          className="flex flex-wrap gap-4"
        >
          {activeSubTab === "liste"
            ? ProjectToEvaluate.map((p: any) => (
                <div key={p.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
                  <ProjectCardToEvaluate
                    project={p}
                    challenge={challenge}
                    onEvaluate={() => setSelectedProject(p)}
                  />
                </div>
              ))
            : ProjectEvaluate.map((p: any) => (
                <div key={p.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
                  <ProjectCardResult
                    challenge={challenge}
                    project={p}
                    totalPosts={ProjectToEvaluate.length}
                  />
                </div>
              ))}
        </motion.div>
      </AnimatePresence>

      {selectedProject && (
        <EvaluateProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function OverviewSection({ challenge }: any) {
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Thème</h2><p className="text-gray-700 mt-2">{challenge.theme}</p></div>
      <div><h2 className="text-xl font-bold">Description</h2><p className="text-gray-700 mt-2">{challenge.description}</p></div>
      <div><h2 className="text-xl font-bold">Objectifs</h2><p className="text-gray-700 mt-2">{challenge.objectifs}</p></div>
      <div><h2 className="text-xl font-bold">Type d'évaluation des projets</h2><p className="text-gray-700 mt-2"> <span className="font-semibold">Hybride :</span> {'Les 15 projets ayant le plus d\'interactions (votes, commentaires et partages) sont eligibles pour la phase finale (qui vient juste apres la date de fin des soumissions de projets ou des inscriptions). Au cours de la phase finale, un jury note les projets finalistes et publie les resultats a l\'issue desquels 5 projets sont retenus vainqueurs.'}</p></div>
      <div>
        <h2 className="text-xl font-bold">Informations</h2>
        <ul className="mt-3 text-gray-700 space-y-2">
          <li className="flex items-center gap-2"><Calendar size={18} className="text-orange-700" /><span>Début : {challenge.start}</span></li>
          <li className="flex items-center gap-2"><Calendar size={18} className="text-orange-700" /><span>Fin : {challenge.end}</span></li>
          <li className="flex items-center gap-2"><MapPin size={18} className="text-orange-700" /><span>Lieu : {challenge.lieu}</span></li>
          <li className="flex items-center gap-2"><Globe size={18} className="text-orange-700" /><span>Site : {challenge.site}</span></li>
          <li className="flex items-center gap-2"><Users size={18} className="text-orange-700" /><span>Participants : {challenge.participants}</span></li>
        </ul>
      </div>

       <div><h2 className="text-xl font-bold">Autres détails</h2><p className="text-gray-700 mt-2">1 seul soumission de projet par participant ou equipe. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam similique, quam pariatur minus mollitia nesciunt numquam quaerat odit eveniet assumenda impedit excepturi itaque rem, dolore molestiae corporis nemo eos.</p></div>
    </div>
  );
}

function ProjectsSection({ challenge }: any) {
  const [activeSubTab, setActiveSubTab] = useState("mes");

  const tabs = [
    { id: "mes", label: "Mes projets" },
    { id: "populaires", label: "Les plus populaires" },
    { id: "tous", label: "Tous les projets" },
  ];

  return (
    <div className="space-y-10 w-full">
      {FakeProject && (
        <div className="flex flex-row justify-center items-center">
          <span className="text-lg font-bold mr-2">{FakeProject.length}</span>
          <span className="text-gray-600">projet(s) au total</span>
        </div>
      )}

      {/* TABS EN FORME DE BULLES */}
      <div className="sticky top-[52px] bg-gray-50/80 backdrop-blur-md z-[30] -mx-3 px-3 py-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-5 py-1 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-300 ${
                activeSubTab === tab.id
                  ? "bg-orange-700 text-white shadow-lg shadow-orange-700/20 scale-105"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-4 w-full"
          >
            {activeSubTab === "mes" &&
              MyProjectByChallenge.map((p: any) => (
                <div key={p.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
                  <ProjectCard project={p} challenge={challenge} />
                </div>
              ))}

            {activeSubTab === "populaires" &&
              MostPopularProject.map((p: any) => (
                <div key={p.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
                  <ProjectCard project={p} challenge={challenge} />
                </div>
              ))}

            {activeSubTab === "tous" &&
              FakeProject.map((p: any) => (
                <div key={p.id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]">
                  <ProjectCard project={p} challenge={challenge} />
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function RulesSection() {
  return (
    <ul className="list-disc pl-6 text-gray-700 space-y-2">
      <li>Règle 1 : ...</li>
      <li>Règle 2 : ...</li>
      <li>Rude 3 : ...</li>
    </ul>
  );
}

function CriteriaSection() {
  return (
    <ul className="list-disc pl-6 text-gray-700 space-y-2">
      <li>Originalité</li>
      <li>Qualité technique</li>
      <li>Impact</li>
    </ul>
  );
}

function RewardsSection() {
  return (
    <ul className="list-disc pl-6 text-gray-700 space-y-2">
      <li>1er : 100.000 FCFA</li>
      <li>2e : 50.000 FCFA</li>
      <li>3e : 20.000 FCFA</li>
    </ul>
  );
}

function ParticipantsSection() {
  const list = [
    { name: "Yvan Dokolo", role: "Génie Logiciel", avatar: "../assets/images/award.jpg" },
    { name: "Sarah M.", role: "IA Developer", avatar: "../assets/images/award.jpg" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-center items-center"><span className="text-lg font-bold mr-2">500</span><span>participants au total</span></div>
      {list.map((p, i) => (
        <Link href={"/profil-talent/1"} key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow">
          <Image src={p.avatar} alt="pp" width={48} height={48} className="rounded-full w-12 h-12 object-cover" />
          <div><p className="font-semibold">{p.name}</p><p className="text-sm text-gray-600">{p.role}</p></div>
        </Link>
      ))}
    </div>
  );
}

function ResultsSection({ fakeProjects, challenge }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Classement final</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {fakeProjects.map((p: any) => (
          <ProjectCardResult key={p.id} project={p} challenge={challenge} totalPosts={fakeProjects.length} large />
        ))}
      </div>
    </div>
  );
}