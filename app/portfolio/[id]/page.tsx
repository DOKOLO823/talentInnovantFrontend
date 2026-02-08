import PortfolioClient from "./PortfolioClient";

// 1. On donne un paramètre fictif pour que l'export statique ne bloque pas
export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // On attend la résolution des paramètres
  const resolvedParams = await params;

  return (
    <main>
      <PortfolioClient userId={resolvedParams.id} />
    </main>
  );
}
