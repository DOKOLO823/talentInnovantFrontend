import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/app/lib/api";

export default function EditProjectModal({ project, isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: project.titre,
    description: project.description,
    year: project.year,
    link: project.link,
    technologie: Array.isArray(project.technologie) ? project.technologie.join(', ') : project.technologie
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description || '');
    data.append('year', formData.year);
    data.append('link', formData.link || '');
    data.append('technologie', formData.technologie);
    
    // Ajout des fichiers si présents
    if (files.length > 0) {
        files.forEach((file) => data.append('medias[]', file));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/talent/portfolio/project/update/${project.id}`, {
        method: 'POST', // On utilise POST car on envoie des fichiers (Multipart/form-data)
        body: data,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const result = await res.json();
      if (res.ok) {
        onSuccess(result.project);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Modifier le projet</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Titre</label>
            <input value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-orange-500" required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl h-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Année</label>
              <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
            <div>
                <label className="text-xs font-bold uppercase text-gray-400">Lien</label>
                <input value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full p-3 border rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Médias (laisser vide pour conserver les anciens)</label>
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="w-full p-2 text-sm" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-orange-700 text-white rounded-xl font-bold flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}