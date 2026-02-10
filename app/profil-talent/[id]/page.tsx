import ProfileClient from "./ProfileClient";

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function Page({ params }: any) {
  // On consomme params pour éviter les erreurs de build
  await params;

  return (
    <main>
      <ProfileClient />
    </main>
  );
}
