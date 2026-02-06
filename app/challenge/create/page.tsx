import CreateChallengeClient from "./CreateChallengeClient";

export default async function Page() {
  // Dans une vraie application, ces données viendraient d'une API
  const jurys = [
    { id: 1, name: "Jury Innovation Tech" },
    { id: 2, name: "Jury Entrepreneuriat" },
    { id: 3, name: "Jury Design & Créativité" },
    { id: 4, name: "Jury Impact Social" },
  ];

  return <CreateChallengeClient jurys={jurys} />;
}