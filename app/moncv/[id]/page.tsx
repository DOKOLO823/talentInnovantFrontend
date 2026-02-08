import PublicCVPage from "./PublicCVPage"; // Ton code actuel renommé

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <PublicCVPage />;
}
