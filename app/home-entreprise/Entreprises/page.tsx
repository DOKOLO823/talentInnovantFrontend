// app/entreprises/page.tsx
import EntreprisesClient from "@/app/components/entreprise/EntreprisesClient";

// export async function generateStaticParams() {
//   return [];
// }

async function getEntreprises() {
  // Simulez ici votre appel API pour "Toutes les entreprises"
  // ou passez les données via les props si vous les avez déjà
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    user_id: 100 + i,
    nom: `Entreprise ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?u=ent${i}`,
    score: Math.floor(Math.random() * 10000),
    is_abonne: false,
    nombre_challenges: Math.floor(Math.random() * 10),
  }));
}

export default async function Page() {
  const entreprises = await getEntreprises();

  return (
    <main className="p-4 sm:p-8 bg-gray-50/30 min-h-screen">
      <EntreprisesClient allEntreprises={entreprises} />
    </main>
  );
}
