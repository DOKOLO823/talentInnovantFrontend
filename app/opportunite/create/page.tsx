import CreateOpportunityClient from "./CreateOpportunityClient";

// export async function generateStaticParams() {
//   return [];
// }

export default async function Page() {
  // Plus tard : fetch API
  const domaines = [
    { id: 1, label: "Développement" },
    { id: 2, label: "Intelligence Artificielle" },
    { id: 3, label: "Design" },
    { id: 4, label: "Entrepreneuriat" },
  ];

  return <CreateOpportunityClient domaines={domaines} />;
}
