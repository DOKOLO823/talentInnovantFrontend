import CreateChallengeClient from "./CreateChallengeClient";


export default async function Page() {
  // Ces données viendront plus tard de l’API
  const domaines = [
    { id: 1, label: "Développement" },
    { id: 2, label: "Intelligence Artificielle" },
    { id: 3, label: "Design" },
    { id: 4, label: "Entrepreneuriat" },
  ];

  const jurys = [
    { id: 1, name: "Jean Dupont" },
    { id: 2, name: "Marie Claire" },
    { id: 3, name: "Paul Ngassa" },
  ];

  return (
    <CreateChallengeClient
      domaines={domaines}
      jurys={jurys}
    />
  );
}
