// app/challenge/search/page.tsx
"use client";

import { Suspense } from "react";
import SearchClient from "./SearchClient";

// export async function generateStaticParams() {
//   return [];
// }

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20">Chargement...</div>}>
      <SearchClient />
    </Suspense>
  );
}
