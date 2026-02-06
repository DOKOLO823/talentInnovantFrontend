// app/profil-talent/edit/[id]/page.tsx
import ProfilEditClient from "./ProfilEditClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfilEditClient userId={id} />;
}