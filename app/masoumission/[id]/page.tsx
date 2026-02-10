import SubmissionDetailClient from "./SubmissionDetailClient";

// 1. On indique à Next.js de ne pas bloquer si l'ID n'est pas pré-généré
// export const dynamicParams = true;

// 2. On ajoute la fonction minimale pour satisfaire le compilateur
export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // On attend la résolution des paramètres
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <main className="min-h-screen bg-slate-50">
      <SubmissionDetailClient postId={id} />
    </main>
  );
}
