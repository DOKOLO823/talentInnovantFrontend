import EntreprisesClient from "@/app/components/entreprise/EntreprisesClient";

export default function Page() {
  const entreprises = Array.from({length:12}).map((_,i)=>({
    id: i+1,
    name: `Entreprise ${i+1}`,
    avatar: `https://i.pravatar.cc/150?img=${20 + i}`,
    score: Math.floor(Math.random()*10000)
  }));

  return <EntreprisesClient entreprises={entreprises} />;
}
