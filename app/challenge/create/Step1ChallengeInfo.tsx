"use client";
import { Upload, Plus } from "lucide-react";

export default function Step1ChallengeInfo({ domaines, jurys, data, onChange, onNext }: any) {
  const update = (key: string, value: any) => onChange((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-14">
      {/* INFOS GÉNÉRALES */}
      <section className="card p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Informations générales</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Titre du challenge</label>
            <input 
              value={data.titre || ""}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" 
              onChange={e => update("titre", e.target.value)} 
              placeholder="Ex: Hackathon IA 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Thème</label>
            <input 
              value={data.theme || ""}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" 
              onChange={e => update("theme", e.target.value)} 
              placeholder="Ex: Innovation Durable"
            />
          </div>
        </div>
      </section>

      {/* JURYS */}
      <section className="card p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Sélection des Jurys</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {jurys.map((user: any) => {
            const isSelected = data.jury_id === user.id; // Ton backend attend un seul jury_id (integer)
            const name = user.statut === 'talent' 
                ? `${user.talent?.nom || ''} ${user.talent?.prenom || ''}` 
                : (user.entreprise?.nom || user.email);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => update("jury_id", user.id)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  isSelected ? "border-orange-600 bg-orange-50 ring-1 ring-orange-600" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className={`font-bold truncate ${isSelected ? "text-orange-700" : "text-slate-900"}`}>{name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.statut}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* DOMAINES */}
      <section className="card p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Domaines d'expertise</h2>
        <div className="flex flex-wrap gap-2">
          {domaines.map((d: any) => {
            const selected = (data.domaines || []).includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  const current = data.domaines || [];
                  update("domaines", selected ? current.filter((id: any) => id !== d.id) : [...current, d.id]);
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  selected ? "bg-orange-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* NAVIGATION */}
      <div className="flex justify-end pt-6">
        <button 
          className="bg-orange-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-800 transition-all active:scale-95" 
          onClick={onNext}
        >
          Continuer vers les détails <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}