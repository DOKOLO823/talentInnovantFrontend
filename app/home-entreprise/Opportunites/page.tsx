// app/home-entreprise/Opportunites/page.tsx
import OpportunitesClient from "@/app/components/entreprise/OpportunitesClient";

// export async function generateStaticParams() {
//   return [];
// }

export default function Page() {
  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <OpportunitesClient />
    </main>
  );
}
