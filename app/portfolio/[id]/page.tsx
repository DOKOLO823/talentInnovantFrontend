import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PortfolioClient userId={resolvedParams.id} />;
}