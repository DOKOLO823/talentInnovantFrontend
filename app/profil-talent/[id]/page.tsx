import ProfileClient from "./ProfileClient";

// 1. On donne un paramètre fictif pour valider l'export statique
export async function generateStaticParams() {
  return [{ id: "index" }];
}

// 2. On utilise une signature simple qui accepte tout
export default async function Page({ params }: any) {
  // On consomme params pour éviter les erreurs de build
  await params;

  return (
    <main>
      <ProfileClient />
    </main>
  );
}
