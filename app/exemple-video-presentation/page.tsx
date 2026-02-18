// app/presentation-challenge/page.tsx
import PresentationClient from "./PresentationClient";

export const metadata = {
  title: "Exemple de Présentation - ENSPM Challenge",
  description:
    "Découvrez comment présenter votre projet pour le challenge ENSPM.",
};

export default function PresentationPage() {
  return <PresentationClient />;
}
