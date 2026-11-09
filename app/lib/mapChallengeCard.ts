// Emplacement : app/lib/mapChallengeCard.ts
// Transforme un challenge renvoyé par l'API en props pour <ChallengeCard />.

import apifile from "@/app/lib/apifile";

export const mapChallengeToCard = (c: any) => ({
  id: c.id,
  user_id: c.user_id,
  title: c.titre,
  description: c.description,
  image: c.photo ? `${apifile}/${c.photo}` : "/assets/images/innov.jpg",
  locationType: c.lieu || "",
  site: c.site || "",
  startDate: c.datelancement || "",
  endDate: c.datefin || "",
  endInscription: c.datefininscription,
  participants: c.participants_count || 0,
  views: c.nombrevues || 0,
  rewards: (() => {
    let rewardsArray = ["Prix non défini"];
    try {
      if (typeof c.recompense === "string" && c.recompense !== "null") {
        rewardsArray = Object.values(JSON.parse(c.recompense));
      } else if (Array.isArray(c.recompense) && c.recompense.length > 0) {
        rewardsArray = c.recompense;
      }
    } catch (e) {
      console.error("Erreur parsing récompenses:", e);
    }
    return rewardsArray;
  })(),
  categories: Array.isArray(c.domaines)
    ? c.domaines.map((d: any) => d.nom || d.name)
    : ["Innovation"],
  inscriptionEnd: c.datefininscription || "Bientôt",
  entrepriseNom: c.user?.entreprise?.nom || "Partenaire",
  entrepriseLogo: c.user?.pp
    ? `${apifile}/${c.user.pp}`
    : "../assets/images/ppe.png",
  entrepriseId: c.user_id,
});