// Emplacement : app/components/pwa/pwaCopy.ts
// Textes de la barre et de la modale d'activation des notifications, selon le rôle.
// ⚠️ Ne promettez que des notifications que vous envoyez réellement.
// Le texte « entreprise » est volontairement général : précisez-le quand vous aurez
// défini les notifications destinées aux entreprises.

export const PUSH_COPY = {
  talent: {
    bar: "Soyez alerté des nouvelles opportunités",
    title: "Ne ratez aucune opportunité",
    text: "Soyez parmi les premiers informés des nouveaux challenges de votre domaine.",
  },
  entreprise: {
    bar: "Restez informé de l'activité de vos challenges",
    title: "Restez informé en temps réel",
    text: "Recevez une alerte dès qu'il se passe quelque chose sur vos challenges.",
  },
} as const;

export const getPushCopy = (role?: string) =>
  role === "entreprise" ? PUSH_COPY.entreprise : PUSH_COPY.talent;