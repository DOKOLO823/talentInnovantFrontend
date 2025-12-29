"use client";

import { Briefcase, ChevronDown, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { apiFetch } from "@/app/lib/api";

export default function FiltreChallenge() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryObject, setCategoryObject] = useState<{ id: number; nom: string } | null>(null);
  
  // États pour stocker les données du backend
  const [domaines, setDomaines] = useState<{ id: number; nom: string }[]>([]);
  const [lieux, setLieux] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCategory(categoryObject ? String(categoryObject.id) : "");
    setCategoryName(categoryObject ? categoryObject.nom : "");
  }, [categoryObject]);

  useEffect(() => {
    const fetchFiltres = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch("/challenges/filtre/options", {
          method: "GET",
        });
        
        if (data) {
          setDomaines(data.domaines || []);
          setLieux(data.lieux || []);
          // console.log("Données de filtre récupérées :", data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des filtres :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiltres();
  }, []);

  return (
    <>
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Trouvez votre prochain défi
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-2"> 
              Explorez les opportunités par domaine ou par ville 
            </p>
          </div>

          {/* Container de recherche */}
          <div className="bg-white p-2 md:p-3 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-stretch gap-2 md:gap-3">
            
            {/* Domaine */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategoryObject(domaines.find((d) => d.id.toString() === e.target.value) || null)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 md:py-4 bg-gray-50 md:bg-transparent text-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 appearance-none text-sm md:text-base font-medium transition-all"
              >
                <option value="">{isLoading ? "Chargement..." : "Tous les domaines"}</option>
                {domaines.map((domaine) => (
                  <option key={domaine.id} value={domaine.id}>
                    {domaine.nom}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute inset-y-0 right-3 m-auto h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Séparateur vertical (visible uniquement sur desktop) */}
            <div className="hidden md:block w-px h-10 bg-gray-200 self-center"></div>

            {/* Lieu */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 md:py-4 bg-gray-50 md:bg-transparent text-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 appearance-none text-sm md:text-base font-medium transition-all"
              >
                {/* Le backend renvoie déjà "Partout" en premier index */}
                {lieux.length > 0 ? (
                  lieux.map((lieu, index) => (
                    <option key={index} value={lieu === "Partout" ? "" : lieu}>
                      {lieu === "Partout" ? "Partout dans le monde" : lieu}
                    </option>
                  ))
                ) : (
                  <option value="">Partout dans le monde</option>
                )}
              </select>
              <ChevronDown className="absolute inset-y-0 right-3 m-auto h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Bouton Rechercher */}
            <Link 
              href={{
                pathname: '/challenge/search',
                query: { domaine: category, lieu: location, domaineName: categoryName },
              }}
              className="flex items-center justify-center px-8 py-3 md:py-4 bg-orange-700 text-white font-bold rounded-xl hover:bg-orange-800 active:scale-95 transition-all shadow-lg shadow-orange-700/20"
              
            >
              <Search className="h-5 w-5 md:mr-2" />
              <span className="md:inline">Rechercher</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}