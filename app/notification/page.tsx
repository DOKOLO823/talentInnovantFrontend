// app/notifications/page.tsx
import NotificationsClient from "./NotificationsClient";

/**
 * Page Serveur pour les Notifications
 * Ce composant sert de point d'entrée. 
 * La logique de récupération de données (fetch) et d'interaction 
 * est gérée par le NotificationsClient pour permettre le reset du compteur au chargement.
 */
export default function NotificationsPage() {
  return (
    <NotificationsClient />
  );
}