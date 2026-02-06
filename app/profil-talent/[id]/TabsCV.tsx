"use client";

import { useState, useEffect } from "react";
import { Plus, X, Maximize2, Trash2, Share2, Eye, Copy, Facebook, MessageCircle, MoreVertical, Edit2, AlertCircle, Loader2, Lock, Building2, Globe } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TabsCV({ userId, currentUser }: any) {
  const [cvs, setCvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});

  const isOwner = currentUser?.id == userId;
  const userStatus = currentUser?.statut;

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/talent/cv-full-info/${userId}`, { method: "GET" });
      if (res?.statut === 200) {
        const allCvs = res.talent.cvs || [];
        const filtered = allCvs.filter((cv: any) => {
          if (isOwner) return true;
          if (cv.visibilite === "monde") return true;
          if (cv.visibilite === "entreprise" && userStatus === "entreprise") return true;
          return false;
        });
        setCvs(filtered);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCvs(); }, [userId]);

  const copyToClipboard = (id: number) => {
    const link = `${window.location.origin}/moncv/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  };

  const validate = (formData: FormData) => {
    const errs: any = {};
    const titre = formData.get("titre") as string;
    const desc = formData.get("description") as string;
    const file = formData.get("cv") as File;

    if (titre && titre.length > 100) {
      errs.titre = `Max 100 caractères autorisés (${titre.length}/100)`;
    }
    if (desc && desc.length > 100) {
      errs.description = `Max 100 caractères autorisés (${desc.length}/100)`;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      errs.cv = "Taille max 10 Mo exigée";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCv = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!validate(formData)) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/cv/add`, { method: "POST", body: formData });
      if (res?.statut === 201) {
        toast.success("CV ajouté");
        setAddOpen(false);
        fetchCvs();
      }
    } catch (error) { toast.error("Erreur"); } finally { setSubmitting(false); }
  };

  const handleUpdateCv = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!validate(formData)) return;
    setSubmitting(true);
    const data = {
      titre: formData.get("titre"),
      description: formData.get("description"),
      visibilite: formData.get("visibilite"),
    };
    try {
      const res = await apiFetch(`/cv/update/${selectedCv.id}`, { 
        method: "POST", 
        body: JSON.stringify(data) 
      });
      if (res?.statut === 200) {
        toast.success("Informations mises à jour");
        setIsEditOpen(false);
        fetchCvs();
      } else {
        toast.error(res?.message || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch(`/cv/delete/${selectedCv.id}`, { method: "POST" });
      if (res?.statut === 200) {
        toast.success("CV supprimé");
        setIsDeleteOpen(false);
        fetchCvs();
      }
    } catch (error) { toast.error("Erreur"); } finally { setSubmitting(false); }
  };

  const ReadMoreText = ({ text, limit }: { text: string, limit: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;
    const words = text.split(/\s+/);
    if (words.length <= limit) return <span>{text}</span>;
    return (
      <span>
        {isExpanded ? text : words.slice(0, limit).join(" ") + "..."}
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-orange-700 font-bold ml-1 text-[10px] uppercase">
          {isExpanded ? "Réduire" : "Lire plus"}
        </button>
      </span>
    );
  };

  if (loading && cvs.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-700" size={40} /></div>;
  }

  return (
    <div className="w-full">
      <Toaster />
      
      <div className="flex justify-between items-center mb-6">
        
        {(cvs.length > 0 && isOwner) && (
          <Link href={`/moncv/${cvs[0].id}`} className="text-orange-700 font-semibold flex items-center gap-1 text-sm border border-orange-700 px-4 py-1.5 rounded-full hover:bg-orange-50 transition">
            <Eye size={16} /> Aperçu du CV
          </Link>
        )}
      </div>

      {cvs.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          
          <h3 className="text-lg font-bold text-slate-800">Aucun CV importé</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs mx-auto">
            {isOwner ? "Vous n'avez pas encore ajouté de CV à votre profil." : "Cet utilisateur n'a pas encore partagé de CV accessible."}
          </p>
          {isOwner && (
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 bg-orange-700 text-white px-6 py-3 rounded-2xl hover:bg-orange-800 transition shadow-lg shadow-orange-100">
              <Plus size={20} /> Importer mon CV
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-2xl space-y-10">
          {cvs.map((cv) => (
            <div key={cv.id}>
                {isOwner && <div className="flex items-center gap-x-2 text-xs text-orange-700 mb-1">
                    <span>Visibilité : </span>
                    <span className="flex items-center gap-x-1">
                         {cv.visibilite === 'monde' ? <Globe size={10}/> : cv.visibilite === 'entreprise' ? <Building2 size={10}/> : <Lock size={10}/>}
                        {cv.visibilite === 'monde' ? 'Public' : cv.visibilite === 'entreprise' ? 'Entreprises' : 'Privé'}
                    </span>
                </div>}

              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 uppercase"><ReadMoreText text={cv.titre} limit={18} /></h3>
                    {isOwner && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider ${
                        cv.visibilite === 'monde' ? 'bg-green-100 text-green-700' : 
                        cv.visibilite === 'entreprise' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                       
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed"><ReadMoreText text={cv.description} limit={18} /></p>
                </div>
                
                {isOwner && (
                  <div className="relative ml-4">
                    <button onClick={() => setActiveDropdown(activeDropdown === cv.id ? null : cv.id)} className="p-2 hover:bg-slate-100 rounded-full transition"><MoreVertical size={20}/></button>
                    <AnimatePresence>
                      {activeDropdown === cv.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden">
                            <button onClick={() => { setSelectedCv(cv); setIsShareOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700"><Share2 size={16}/> Partager</button>
                            <button onClick={() => { setSelectedCv(cv); setIsEditOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700"><Edit2 size={16}/> Modifier</button>
                            <div className="h-[1px] bg-slate-100 my-1" />
                            <button onClick={() => { setSelectedCv(cv); setIsDeleteOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 font-medium"><Trash2 size={16}/> Supprimer</button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Message d'info de visibilité pour les tiers */}
              {!isOwner && cv.visibilite === "entreprise" && userStatus === "entreprise" && (
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-orange-700 px-3 py-1.5 rounded-lg w-fit">
                  <Building2 size={14} /> Ce CV est visible car vous êtes un recruteur
                </div>
              )}

              <div className="flex justify-end mb-2 mt-8">
                 <button onClick={() => { setSelectedCv(cv); setIsFullscreen(true); }} className="flex items-center gap-2 text-orange-700 font-bold text-xs hover:text-orange-700 transition uppercase tracking-wider">
                    <Maximize2 size={14} /> Voir en plein écran
                 </button>
              </div>

              <div className="relative w-full h-[450px] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden group shadow-sm">
                <iframe src={`${apifile}/${cv.lien}#toolbar=0`} className="w-full h-full border-none pointer-events-none md:pointer-events-auto" />
                <div onClick={() => { setSelectedCv(cv); setIsFullscreen(true); }} className="absolute inset-0 bg-black/0 group-hover:bg-black/5 cursor-zoom-in transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Les Modals (Add/Edit, Share, Delete, Fullscreen) restent identiques au code fourni */}
      <AnimatePresence>
        {(isAddOpen || isEditOpen) && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl py-8 px-5 w-full max-w-md shadow-2xl relative">
              <button onClick={() => { setAddOpen(false); setIsEditOpen(false); setErrors({}); }} className="absolute top-6 right-6 p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6">{isAddOpen ? "Importer mon CV" : "Modifier le CV"}</h3>
              <form onSubmit={isAddOpen ? handleAddCv : handleUpdateCv} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Titre (facultatif)</label>
                  <input name="titre" defaultValue={isEditOpen ? selectedCv?.titre : ""} className={`w-full p-4 mt-1 bg-slate-50 border ${errors.titre ? 'border-red-500' : 'border-slate-200'} rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition`} />
                  {errors.titre && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium tracking-wide italic leading-none ml-1 uppercase underline decoration-red-200"><AlertCircle size={10}/> {errors.titre}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description (facultative)</label>
                  <textarea name="description" defaultValue={isEditOpen ? selectedCv?.description : ""} className={`w-full p-4 mt-1 bg-slate-50 border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-2xl h-28 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition`} />
                  {errors.description && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium tracking-wide italic leading-none ml-1 uppercase underline decoration-red-200"><AlertCircle size={10}/> {errors.description}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Visibilité</label>
                  <select name="visibilite" defaultValue={isEditOpen ? selectedCv?.visibilite : "monde"} className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                    <option value="monde">Tout le monde</option>
                    <option value="entreprise">Recruteurs uniquement</option>
                    <option value="moi">Confidentiel (Moi uniquement)</option>
                  </select>
                </div>
                {isAddOpen && (
                  <div className="pt-0.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">Importer mon fichier CV (PDF uniquement)</label>
                    <div className={`border-2 border-dashed ${errors.cv ? 'border-red-300 bg-red-50' : 'border-slate-200'} rounded-2xl p-6 text-center`}>
                     
                      <input type="file" name="cv" accept=".pdf" required className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700" />
                    </div>
                    {errors.cv && <p className="text-red-500 text-[10px] mt-1 italic uppercase ml-1 tracking-wider">{errors.cv}</p>}
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full bg-orange-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 shadow-xl shadow-slate-200">
                  {submitting ? <Loader2 className="animate-spin" size={20}/> : (isAddOpen ? "Enregistrer" : "Mettre à jour")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShareOpen && selectedCv && (
          <div className="fixed inset-0 z-[650] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative">
              <button onClick={() => setIsShareOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full"><X size={20}/></button>
              <h3 className="text-lg font-bold mb-6 text-slate-900 uppercase tracking-tighter">Partager mon profil</h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => { const link = encodeURIComponent(`${window.location.origin}/moncv/${selectedCv.id}`); window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, "_blank"); }} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Facebook size={24}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facebook</span>
                </button>
                <button onClick={() => { const link = encodeURIComponent(`${window.location.origin}/moncv/${selectedCv.id}`); window.open(`https://api.whatsapp.com/send?text=${link}`, "_blank"); }} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-all"><MessageCircle size={24}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp</span>
                </button>
                <button onClick={() => copyToClipboard(selectedCv.id)} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-slate-600 group-hover:text-white transition-all"><Copy size={24}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Copier</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[650] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-red-50">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 size={32} /></div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Confirmer la suppression ?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Cette action supprimera définitivement votre CV. Souhaitez-vous continuer ?</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                <button onClick={confirmDelete} disabled={submitting} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-red-700 transition shadow-lg shadow-red-100 uppercase text-xs tracking-widest">
                  {submitting ? "..." : "Supprimer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && selectedCv && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/95">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-xl">
                <span className="text-white font-bold text-sm tracking-tight">{selectedCv.titre}</span>
                <button onClick={() => setIsFullscreen(false)} className="p-2 bg-white/20 text-white rounded-full hover:bg-red-500 transition"><X size={20}/></button>
              </div>
              <iframe src={`${apifile}/${selectedCv.lien}`} className="flex-1 w-full border-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}