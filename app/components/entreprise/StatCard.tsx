// components/entreprise/StatCard.tsx

import { LucideIcon, Zap, Users, Shield, Trophy, TrendingUp, BarChart } from "lucide-react";

// Définition de l'interface complète de la stat pour plus de clarté
interface StatConfig { 
    Icon: LucideIcon, 
    color: string,      // Ex: 'text-blue-600'
}

// Fonction utilitaire pour mapper le label à une icône et des classes CSS de couleur
const getStatIcon = (label: string): StatConfig => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('challenge')) {
    // Note: Utilisation des couleurs pour l'icône
    if (lowerLabel.includes('cours')) 
        return { Icon: TrendingUp, color: 'text-green-600' };
    return { Icon: Zap, color: 'text-orange-700' };
  }
  if (lowerLabel.includes('abonné')) {
    return { Icon: Users, color: 'text-orange-700' };
  }
  if (lowerLabel.includes('point')) {
    return { Icon: Shield, color: 'text-orange-700' };
  }
  if (lowerLabel.includes('rang')) {
    return { Icon: Trophy, color: 'text-orange-700' }; // L'icône du rang est Orange 700
  }
  // Icône par défaut
  return { Icon: BarChart, color: 'text-orange-700' };
};

export default function StatCard({ label, value }: { label:string; value:any }) {
  const { Icon, color } = getStatIcon(label);
  
  // Rendre l'arrière-plan de l'icône très clair
  const iconBg = color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100').replace('-500', '-100');


  return (
    <div className={`
      relative bg-white 
      rounded-xl p-5 
      shadow-md
      border-t-4 border-orange-700  // BORRURE FIXÉE ICI
      text-left 
      transition-all duration-300
      hover:shadow-2xl hover:scale-[1.01]
    `}>
      
      {/* Mise en évidence de la valeur */}
      <p className="text-xl md:text-3xl font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      
      {/* Étiquette / Titre */}
      <p className="text-sm font-medium text-gray-500 mt-2">
        {label}
      </p>
      
      {/* Icône dynamique */}
      <div className={`absolute top-4 right-4 p-2 rounded-full ${iconBg}`}>
        <Icon size={24} className={`${color}`} />
      </div>
    </div>
  );
}