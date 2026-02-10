import EditChallengeClient from "./EditChallengeClient";

interface EditChallengePageProps {
  params: Promise<{ id: string }>;
}

// 1. On indique à Next.js de ne pas bloquer si l'ID n'est pas pré-généré
// export const dynamicParams = true;

// 2. On ajoute la fonction minimale pour satisfaire le compilateur
export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function EditChallengePage({
  params,
}: EditChallengePageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50">
      <EditChallengeClient challengeId={id} />
    </main>
  );
}
