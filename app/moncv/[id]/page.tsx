import PublicCVPage from "./PublicCVPage"; // Ton code actuel renommé

// export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default function Page() {
  return <PublicCVPage />;
}
