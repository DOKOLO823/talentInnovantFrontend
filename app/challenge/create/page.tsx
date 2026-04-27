import { Suspense } from "react"; // 1. Importer Suspense
import CreateChallengeClient from "./CreateChallengeClient";

export default async function Page() {
  const jurys = [
    { id: 1, name: "Jury Innovation Tech" },
    { id: 2, name: "Jury Entrepreneuriat" },
    { id: 3, name: "Jury Design & Créativité" },
    { id: 4, name: "Jury Impact Social" },
  ];

  // 2. Envelopper le composant dans Suspense
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <CreateChallengeClient jurys={jurys} />
    </Suspense>
  );
}
