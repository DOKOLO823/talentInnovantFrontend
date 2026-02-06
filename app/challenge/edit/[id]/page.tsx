import EditChallengeClient from "./EditChallengeClient";

interface EditChallengePageProps {
  params: Promise<{ id: string }>; // On définit params comme une Promise
}

export default async function EditChallengePage({ params }: EditChallengePageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* On injecte l'ID désenveloppé dans le composant Client */}
      <EditChallengeClient challengeId={id} />
    </main>
  );
}