"use client";

// Emplacement : app/components/recherche/FiltreChallenge.tsx (remplace l'ancien fichier)
// Utilisé par la page d'accueil guest : même import qu'avant, nouveau contenu.

import ChallengeSearchBox from "./ChallengeSearchBox";

export default function FiltreChallenge() {
  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Trouvez votre prochain challenge
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Explorez les challenges par mot-clé, domaine ou ville
          </p>
        </div>

        <ChallengeSearchBox />
      </div>
    </section>
  );
}
