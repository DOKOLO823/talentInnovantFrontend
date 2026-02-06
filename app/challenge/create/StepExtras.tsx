export default function StepExtras({ data, onChange }: any) {
  const update = (k: string, v: any) =>
    onChange((p: any) => ({ ...p, [k]: v }));

  return (
    <section className="card">
      <h2 className="card-title">Compléments</h2>

      <textarea className="textarea" placeholder="Objectif du challenge"
        onChange={e => update("objectif", e.target.value)} />

      <textarea className="textarea mt-4" placeholder="Détails supplémentaires"
        onChange={e => update("details", e.target.value)} />
    </section>
  );
}
