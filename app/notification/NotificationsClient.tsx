// app/notifications/NotificationsClient.tsx

"use client";

import { useState, useMemo } from "react"; // useMemo ajouté pour le tri
import Link from "next/link";
import { Trash2, Info, X, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import BackButton from "../components/BackButton";

// Types pour la clarté - 'read' est supprimé
interface Notification {
  id: number;
  message: string;
  date: string;
  href: string;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

/**
 * Fonction utilitaire native pour formater la date en "il y a X temps"
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (diffInSeconds < 60) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (weeks < 4) return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Composant de Carte de Notification (Design uniforme et sans gestion de lecture)
 */
function NotificationCard({ notification, onDelete }: { notification: Notification, onDelete: (id: number) => void }) {
  
  return (
    <Link 
      href={notification.href}
      className={`
        relative flex items-center py-4 md:py-5 border-b last:border-b-0 transition-all duration-300
        bg-white hover:bg-gray-50 
        cursor-pointer mb-3
      `}
    >
      {/* Trait vertical Orange-700 (pour le style) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-700 rounded-l-lg"></div>

      {/* Contenu de la notification (Style uniforme) */}
      <div className="flex-grow ml-3 md:ml-4">
        <p className="text-base font-semibold text-gray-900">
          {notification.message}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          {formatDate(notification.date)}
        </p>
      </div>

      {/* Bouton de Suppression - Clic nécessite e.stopPropagation() pour éviter la navigation du Link */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notification.id); }} 
        className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 opacity-70 hover:opacity-100"
        aria-label={`Supprimer la notification ${notification.id}`}
        title="Supprimer"
      >
        <X size={18} />
      </button>
    </Link>
  );
}


/**
 * Composant Client Principal de la Page Notifications
 */
export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  // Tri des notifications une seule fois par date la plus récente en haut
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notifications]);

  // LOGIQUE DE SUPPRESSION
  const handleDelete = (idToDelete: number) => {
    setNotifications(prev => prev.filter(n => n.id !== idToDelete));
  };
  
  // LOGIQUE DE SUPPRESSION TOUT
  const handleDeleteAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-22 pb-24">
        <Navbar/>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
         <BackButton m={4} />
        
        {/* En-tête de la page */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Notifications 
            {/* L'affichage d'un badge de comptage n'a plus de sens sans l'état 'read', on le retire. */}
          </h1>
          
          {/* Boutons d'action : Il ne reste que Supprimer Tout */}
         
        </div>

        {/* Conteneur des notifications */}
        <div className="rounded-xl overflow-hidden divide-y divide-gray-200 border border-gray-100">
          
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map(n => (
              <NotificationCard 
                key={n.id} 
                notification={n} 
                onDelete={handleDelete} 
                // onMarkRead n'est plus nécessaire ici
              />
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
              <p className="text-xl font-medium">Votre boîte est vide !</p>
              <p className="text-sm">Aucune notification à afficher pour l'instant.</p>
            </div>
          )}
        </div>
        
      </div>
      <BottomBar/>
    </div>
  );
}