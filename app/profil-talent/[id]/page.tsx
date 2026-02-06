// app/profil-talent/[id]/page.tsx
import ProfileClient from "./ProfileClient";

export default function Page({ params }: { params: { id: string } }) {
  return <ProfileClient />;
}