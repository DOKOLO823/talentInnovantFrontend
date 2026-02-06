import ChallengeClient from "./ChallengeClient";

// Cette fonction règle votre erreur de "Runtime Error"
export async function generateStaticParams() {
  return []; 
}

// On force Next.js à ne pas chercher à générer les pages au build
export const dynamicParams = true; 

export default function ChallengePage() {
  return <ChallengeClient />;
}