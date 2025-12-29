import TalentsClient from "@/app/components/entreprise/TalentsClient";


export default function Page() {
  const talents = Array.from({length:24}).map((_,i)=>({
    id:i+1,
    name: `Talent ${i+1}`,
    avatar: `https://i.pravatar.cc/150?img=${10 + i}`,
    profession: i%2===0 ? "Développeur" : "Data Scientist",
    points: Math.floor(Math.random()*10000)
  }));

  return <TalentsClient talents={talents} />;
}
