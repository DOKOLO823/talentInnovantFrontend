"use client";

export default function TabsAbout({ user }: any) {
  return (
    <div className="space-y-3">
      <Item label="Compétences" value={user.skills?.join(", ")} />
      <Item label="Points" value={user.points} />
      <Item label="Trophées gagnés" value={user.trophies} />
      <Item label="Région" value={user.region} />
      <Item label="Ville" value={user.city} />
      <Item label="Localisation" value={user.location} />
    </div>
  );
}

function Item({ label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-12">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}
