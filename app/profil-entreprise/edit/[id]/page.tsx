// app/profil-entreprise/edit/[id]/page.tsx
import EntrepriseEditClient from "./EntrepriseEditClient";

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntrepriseEditClient id={id} />;
}
