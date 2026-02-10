// app/profil-entreprise/[id]/page.tsx
import EntrepriseProfileClient from "./EntrepriseProfileClient";

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <main className="min-h-screen bg-white">
      <EntrepriseProfileClient id={id} />
    </main>
  );
}
