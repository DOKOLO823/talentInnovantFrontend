import SubmissionDetailClient from "./SubmissionDetailClient";

// On ajoute 'async' pour pouvoir utiliser 'await params'
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // On attend la résolution des paramètres
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <main className="min-h-screen bg-slate-50">
      <SubmissionDetailClient postId={id} />
    </main>
  );
}