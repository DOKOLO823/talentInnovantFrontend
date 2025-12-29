// app/notifications/page.tsx

import NotificationsClient from "./NotificationsClient";

// Interface simplifiée - 'read' est supprimé
interface Notification {
  id: number;
  message: string;
  date: string;
  href: string; // Ajout du lien
}

// Données factices de notifications
const fakeNotifications: Notification[] = [
  {
    id: 1,
    message: "Votre projet 'Mokine' a été approuvé par l'administrateur. Votre projet 'Mokine' a été approuvé par l'administrateur.",
    date: "2025-12-10T10:00:00Z",
    href: "/projets/mokine-1",
  },
  {
    id: 2,
    message: "Félicitations ! Vous avez gagné 50 points d'expérience.",
    date: "2025-12-09T15:30:00Z",
    href: "/profil-talent/rewards",
  },
  {
    id: 3,
    message: "Le Challenge 'GreenTech' est maintenant ouvert aux inscriptions.",
    date: "2025-12-08T08:45:00Z",
    href: "/challenges/greentech",
  },
  {
    id: 4,
    message: "L'entreprise 'Orange' a consulté votre profil.",
    date: "2025-12-07T18:10:00Z",
    href: "/profil-entreprise/orange",
  },
  {
    id: 5,
    message: "Rappel : Le pitch du projet 'MaxiPlay' est demain.",
    date: "2025-12-06T12:00:00Z",
    href: "/evenements/pitch-maxiplay",
  },
];


export default function NotificationsPage() {
  const notifications = fakeNotifications;

  return (
    <NotificationsClient initialNotifications={notifications} />
  );
}