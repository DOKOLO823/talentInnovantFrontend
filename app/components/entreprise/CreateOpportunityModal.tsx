"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Link2, Loader2, Search, ChevronDown, Calendar } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import domainesJSON from "@/domaines.json";

export default function CreateOpportunityModal({ onClose, onSuccess, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialisation avec fallback sur l'ID et le nom du domaine
  const [form, setForm] = useState<any>({
    titre: initialData?.titre || "",
    description: initialData?.description || "",
    type: initialData?.type || "Emploi",
    domaine_id: initialData?.domaine_id || initialData?.domaine?.id || "",
    domaine_name: initialData?.domaine?.nom || initialData?.domaine || "",
    linkType: (initialData?.format === "image" || initialData?.format === "pdf" || initialData?.format === "document") ? "file" : "url",
    lien: initialData?.lien || null,
    delai: initialData?.delaicandidature ? initialData.delaicandidature.split('T')[0] : "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (key: string, value: any) => setForm((p: any) => ({ ...p, [key]: value }));

  const filteredDomaines = domainesJSON.filter((d: any) =>
    (d.nom || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePublish = async () => {
    if (!form.titre || !form.domaine_id || !form.delai) {
      return toast.error("Veuillez remplir les champs obligatoires");
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("titre", form.titre);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("domaine_id", form.domaine_id.toString());
    formData.append("delai", form.delai);

    if (form.lien instanceof File) {
      formData.append("lien", form.lien);
    } else if (form.linkType === "url" && typeof form.lien === "string") {
      formData.append("lien", form.lien);
    }

    try {
      const endpoint = initialData ? `/opportunite/update/${initialData.id}` : "/opportunites";
      const res = await apiFetch(endpoint, { method: "POST", body: formData });

      if (res.statut === 200 || res.statut === 201) {
        toast.success(initialData ? "Modification enregistrée" : "Opportunité publiée");
        onSuccess(res.data || res);
        onClose();
      } else {
        toast.error(res.message || "Une erreur est survenue");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
       <Toaster/>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl border border-slate-200 shadow-xl flex flex-col max-h-[95vh] rounded-xl overflow-hidden"
      >
       
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{initialData ? "Modifier l'opportunité" : "Nouvelle publication"}</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Formulaire de dépôt d'offre</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Intitulé du poste <span className="text-red-500">*</span></label>
            <input
              value={form.titre}
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
              placeholder="ex: Responsable Administratif et Financier"
              onChange={(e) => update("titre", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Type de contrat</label>
              <div className="relative">
                <select 
                  value={form.type}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm appearance-none cursor-pointer focus:border-blue-600 outline-none shadow-sm"
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option>Emploi</option>
                  <option>Stage</option>
                  <option>Autre</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-[13px] font-semibold text-slate-700">Domaine d'activité <span className="text-red-500">*</span></label>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm flex justify-between items-center text-left focus:border-blue-600 shadow-sm"
              >
                <span className={form.domaine_name ? "text-slate-900" : "text-slate-400"}>
                  {form.domaine_name || "Sélectionner un domaine"}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute z-[110] w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-md overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          autoFocus
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 pl-8 text-xs outline-none"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredDomaines.map((d: any) => (
                        <button
                          key={d.id} type="button"
                          onClick={() => {
                            update("domaine_id", d.id);
                            update("domaine_name", d.nom);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors border-b border-slate-50 last:border-0 ${form.domaine_id == d.id ? 'bg-blue-50 font-bold text-blue-700' : ''}`}
                        >
                          {d.nom}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Description détaillée</label>
              <textarea
                value={form.description}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none min-h-[120px] focus:border-blue-600 shadow-sm"
                placeholder="Missions, profil recherché..."
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Échéance <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={form.delai}
                  className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2.5 text-xs font-medium outline-none focus:border-blue-600 shadow-sm"
                  onChange={(e) => update("delai", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="text-[13px] font-semibold text-slate-700 block mb-3">Modalités de candidature</label>
            <div className="flex border border-slate-200 rounded-md w-fit mb-4 bg-slate-50 p-1">
              {['url', 'file'].map((type) => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => update("linkType", type)}
                  className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
                    form.linkType === type ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type === 'url' ? 'Lien de candidature' : 'Document PDF / Image'}
                </button>
              ))}
            </div>

            {form.linkType === "url" ? (
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={typeof form.lien === 'string' ? form.lien : ""}
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 pl-9 text-sm outline-none focus:border-blue-600 shadow-sm"
                  placeholder="https://votre-site-rh.com"
                  onChange={(e) => update("lien", e.target.value)}
                />
              </div>
            ) : (
              <label className="flex items-center gap-4 border border-dashed border-slate-300 rounded-md p-5 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-300 cursor-pointer transition-all">
                <div className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-400 shadow-sm"><Upload size={18} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {form.lien instanceof File ? form.lien.name : (initialData?.lien ? "Fichier actuel conservé" : "Téléverser le fichier")}
                  </p>
                  <p className="text-[11px] text-slate-500">PDF ou Image (Max 5Mo)</p>
                </div>
                <input type="file" hidden onChange={(e) => update("lien", e.target.files?.[0])} />
              </label>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Annuler</button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-orange-700 text-white px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {initialData ? "Mettre à jour" : "Publier l'opportunité"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}