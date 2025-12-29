// app/home-entreprise/Opportunites/page.tsx

import OpportunitesClient from "@/app/components/entreprise/OpportunitesClient";




export default function Page() {
  const opportunites = [
    {
      id:1,
      titre:"Développeur Backend",
      type:"Emploi",
      domaine:"Informatique",
      description:"Développeur Laravel/Node.js",
      date_limite:"2025-03-01",
      like: 12,
      lien:"#",
      entreprise:{ nom:"TechCorp", logo:"https://i.pravatar.cc/40?img=5" }
    },
    {
      id:2,
      titre:"Stage Data Analyst",
      type:"Stage",
      domaine:"Data",
      description:"Stage 3 mois - Python, SQL",
      date_limite:"2025-04-01",
      like: 4,
      lien:"#",
      entreprise:{ nom:"DataLab", logo:"https://i.pravatar.cc/40?img=6" }
    },
     {
      id:2,
      titre:"Data Analyst",
      type:"Emploi",
      domaine:"Data",
      description:"Du 3 mois - Python, SQL",
      date_limite:"2025-04-01",
      like: 4,
      lien:"#",
      entreprise:{ nom:"DataLab", logo:"https://i.pravatar.cc/40?img=6" }
    }
  ];

  return <OpportunitesClient opportunites={opportunites} />;
}
