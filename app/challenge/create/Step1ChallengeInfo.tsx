"use client";

import { Upload, Plus } from "lucide-react";

export default function Step1ChallengeInfo({
  domaines,
  jurys,
  data,
  onChange,
  onNext,
}: any) {
  const update = (key: string, value: any) =>
    onChange((prev: any) => ({ ...prev, [key]: value }));

  const updateArray = (key: string, index: number, value: string) => {
    const copy = [...(data[key] || [""])];
    copy[index] = value;
    update(key, copy);
  };

  const addArrayItem = (key: string) =>
    update(key, [...(data[key] || [""]), ""]);

  const evaluationHelp: Record<string, string> = {
    Jury:
      "Les projets sont évalués et notés exclusivement par un jury.",
    Vote:
      "Les meilleurs projets sont ceux ayant obtenu le plus de votes.",
    Hybride:
      "Une première sélection se fait par vote, puis le jury effectue la sélection finale.",
  };

  return (
    <div className="space-y-14">

      {/* ================= INFOS GÉNÉRALES ================= */}
      <section className="card">
        <h2 className="card-title">Informations générales</h2>
        <p className="card-desc">
          Présentez clairement votre challenge pour attirer les meilleurs talents
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div>
            <label className="label">Titre du challenge</label>
            <input
              className="input"
              placeholder="Hackathon Innovation 2025"
              onChange={e => update("titre", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Thème</label>
            <input
              className="input"
              placeholder="Intelligence artificielle"
              onChange={e => update("theme", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              rows={4}
              className="textarea"
              placeholder="Décrivez le contexte, les objectifs et les attentes du challenge"
              onChange={e => update("description", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Autres détails (facultatif)</label>
            <textarea
              rows={3}
              className="textarea"
              placeholder="Informations complémentaires, prérequis spécifiques, etc."
              onChange={e => update("details_supplementaires", e.target.value)}
            />
          </div>
        </div>

        <label className="upload-zone mt-8">
          <Upload className="w-6 h-6 text-orange-600" />
          <span className="text-sm text-gray-600">
            Ajouter une image représentative du challenge
          </span>
          <input type="file" hidden />
        </label>
      </section>

      {/* ================= PLANNING ================= */}
      <section className="card">
        <h2 className="card-title">Planning</h2>
        <p className="card-desc">
          Définissez clairement les dates clés du challenge
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div>
            <label className="label">Date de lancement</label>
            <input
              type="datetime-local"
              className="input"
              onChange={e => update("datelancement", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Fin des inscriptions</label>
            <input
              type="datetime-local"
              className="input"
              onChange={e => update("datefininscription", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Fin du challenge</label>
            <input
              type="datetime-local"
              className="input"
              onChange={e => update("datefin", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ================= ORGANISATION ================= */}
      <section className="card">
        <h2 className="card-title">Organisation</h2>
        <p className="card-desc">
          Définissez le cadre et le mode d’évaluation du challenge
        </p>

        <div className="space-y-6 mt-8">
          <div>
            <label className="label">Lieu du challenge</label>
            <select
              className="select"
              value={data.site || "sur"}
              onChange={e => update("site", e.target.value)}
            >
              <option value="sur">Sur Talent Innovant</option>
              <option value="hors">Hors Talent Innovant</option>
            </select>
          </div>

           {data.site === "hors" && (
            <div>
              <label className="label">Lien du formulaire externe</label>
              <input
                className="input"
                placeholder="https://example.com/inscription"
                onChange={e => update("lien", e.target.value)}
              />
            </div>
          )}
          
          {/* ✅ PORTÉE DU CHALLENGE (MODIFIÉ) */}
          <div>
            <label className="label">Portée du challenge</label>
            <select
              className="select"
              value={data.portee || "public"}
              onChange={e => update("portee", e.target.value)}
            >
              <option value="public">Public (visible par tous)</option>
              <option value="prive">Privé (accès restreint)</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {data.portee === "prive" 
                ? "Le challenge est visible par tout le monde mais seul les organisateurs on acces aux projets et a la liste des participants du challenges." 
                : "Le challenge est visible par tout le monde y compris ses projets et ses participants."}
            </p>
          </div>

          <div>
            <label className="label">Type d’évaluation</label>
            <select
              className="select"
              value={data.typeevaluation || "Jury"}
              onChange={e => {
                const val = e.target.value;
                update("typeevaluation", val);
                update("nombre_gagnants", val === "Hybride" ? ["", ""] : [""]);
              }}
            >
              <option value="Jury">Jury</option>
              <option value="Vote">Vote</option>
              <option value="Hybride">Hybride</option>
            </select>

            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              {evaluationHelp[data.typeevaluation || "Jury"]}
            </p>
          </div>

          {/* NOMBRE DE GAGNANTS (MODIFIÉ : FOND SUPPRIMÉ) */}
          <div className="space-y-4 pt-2">
            {data.typeevaluation === "Hybride" ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-gray-600">Nombre de gagnants de la Phase 1 (Vote)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="Ex: 10"
                    value={data.nombre_gagnants?.[0] || ""}
                    onChange={e => {
                      const newGagnants = [...(data.nombre_gagnants || ["", ""])];
                      newGagnants[0] = e.target.value;
                      update("nombre_gagnants", newGagnants);
                    }}
                  />
                </div>
                <div>
                  <label className="label text-gray-600">Nombre de gagnants de la Phase Finale (Jury)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="Ex: 3"
                    value={data.nombre_gagnants?.[1] || ""}
                    onChange={e => {
                      const newGagnants = [...(data.nombre_gagnants || ["", ""])];
                      newGagnants[1] = e.target.value;
                      update("nombre_gagnants", newGagnants);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-xs">
                <label className="label text-gray-600">Nombre de gagnants</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Ex: 3"
                  value={data.nombre_gagnants?.[0] || ""}
                  onChange={e => update("nombre_gagnants", [e.target.value])}
                />
              </div>
            )}
          </div>

          {/* NOMBRE DE SOUMISSIONS MAX (MODIFIÉ : VALEUR PAR DÉFAUT 1) */}
          <div>
            <label className="label">Nombre de soumissions autorisées par participant/équipe</label>
            <input
              type="number"
              min="1"
              className="input"
              value={data.limite_soumissions || 1}
              onChange={e => update("limite_soumissions", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ================= DOMAINES ================= */}
      <section className="card">
        <h2 className="card-title">Domaines du challenge</h2>
        <p className="card-desc">
          Sélectionnez un ou plusieurs domaines concernés
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          {domaines.map((d: any) => {
            const selected = (data.domaines || []).includes(d.id);

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  const current = data.domaines || [];
                  update(
                    "domaines",
                    selected
                      ? current.filter((id: number) => id !== d.id)
                      : [...current, d.id]
                  );
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                  ${
                    selected
                      ? "bg-orange-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= LISTES DYNAMIQUES ================= */}
      {["Règle du challenge", "Public cible", "Récompense", "Critère d'évaluation"].map(
        key => (
          <section key={key} className="card">
            <h2 className="card-title capitalize">{key}</h2>

            <div className="space-y-3 mt-6">
              {(data[key] || [""]).map((_: any, i: number) => (
                <input
                  key={i}
                  className="input"
                  placeholder={`${key} ${i + 1}`}
                  onChange={e =>
                    updateArray(key, i, e.target.value)
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem(key)}
              className="add-btn mt-4"
            >
              <Plus size={16} />
              Ajouter autre {key}
            </button>
          </section>
        )
      )}

      {/* ================= ACTION ================= */}
      <div className="flex justify-end pt-8">
        <button className="btn-primary" onClick={onNext}>
          {data.site === "sur"
            ? "Suivant →"
            : "Publier le challenge"}
        </button>
      </div>
    </div>
  );
}