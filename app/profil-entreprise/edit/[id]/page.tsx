// app/profil-entreprise/edit/[id]/page.tsx
import EntrepriseEditClient from "./EntrepriseEditClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EntrepriseEditClient id={id} />;
}