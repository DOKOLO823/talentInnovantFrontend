import { 
  Info, 
  Briefcase, 
  Clock, 
  Globe, 
  Trophy, 
  Users,
  TrendingUp
} from "lucide-react";

export default function TabAbout({ entreprise, total }: any) {
  
  const calculatePerformance = (rank: any, totalCount: any) => {
    const r = parseInt(rank);
    const t = parseInt(totalCount);

    if (isNaN(r) || isNaN(t) || t === 0) return "Calcul en cours...";
    
    // Cas particulier : 1ère place
    if (r === 1) return "1ère sur l'ensemble de la plateforme";
    
    // Cas où il y a très peu d'entreprises
    if (t < 10) return `${r}${r === 1 ? 'ère' : 'ème'} sur l'ensemble de la plateforme`;

    // Ta formule de calcul de centile
    const perf = (1 - (r / t)) * 100;
    const topPercent = Math.max(Math.min(100 - Math.round(perf) + 1, 100), 1);
    
    return `Top ${topPercent}% des meilleures entreprises`;
  };

  return (
    <div className="max-w-5xl space-y-8 mb-12">
      {/* Section Description - Professionnelle et Sobre */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-3 text-gray-900">
          <Info className="w-5 h-5 text-orange-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Description</h3>
        </div>
        <p className="text-gray-700 leading-relaxed italic">
          {entreprise?.description || ""}
        </p>
      </section>

      {/* Grille d'informations - Forme demandée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* domaine  */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <Briefcase className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Domaine</h4>
            <p className="text-gray-600 mt-1">{entreprise?.user?.domaine?.nom|| ""}</p>
          </div>
        </div>
        
        {/* Services */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <Briefcase className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Services</h4>
            <p className="text-gray-600 mt-1">{entreprise?.service || ""}</p>
          </div>
        </div>

        {/* Performance - Calculé dynamiquement selon tes règles */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <TrendingUp className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Performance Globale</h4>
            <p className="text-orange-700 font-semibold mt-1">
              {calculatePerformance(entreprise?.rang, total)}
            </p>
          </div>
        </div>

        {/* Abonnés */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <Users className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Communauté</h4>
            <p className="text-gray-600 mt-1">{entreprise?.abonnees_count || 0} abonné(s)</p>
          </div>
        </div>

        {/* Horaires */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <Clock className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Disponibilité</h4>
            <p className="text-gray-600 mt-1">{entreprise?.horaire || ""}</p>
          </div>
        </div>

        {/* Site Web */}
       {entreprise?.siteweb &&  <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-white shadow-sm rounded-r-lg">
          <Globe className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Site Officiel</h4>
            <a
              href={entreprise.siteweb?.startsWith('http') ? entreprise.siteweb : `https://${entreprise.siteweb}`}
              target="_blank"
              className="text-orange-700 hover:underline font-medium mt-1 block"
            >
              {entreprise?.siteweb || "#"}
            </a>
          </div>
        </div> } 

        {/* Points */}
        <div className="flex gap-4 p-4 border-l-4 border-orange-700 bg-orange-50/30 shadow-sm rounded-r-lg">
          <Trophy className="w-6 h-6 text-orange-700 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase">Score d'activité</h4>
            <p className="text-orange-700 font-black text-xl mt-1">
              {entreprise.point || 0} <span className="text-xs uppercase">pts</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}