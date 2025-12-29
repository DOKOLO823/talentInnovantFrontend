import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Challenge {
  id: number;
  title: string;
  image: string;
  locationType: string;
  site: string;
  startDate: string;
  endDate: string;
  participants: number;
  rewards: string[];
  categories: string[];
  inscriptionEnd: string;
  entrepriseNom: string;
  entrepriseLogo: string;
  entrepriseId: number;
}

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [openRewards, setOpenRewards] = useState(false);
  const router = useRouter();

  const challengeDetail = () => {
  // Redirection
  router.push(`/challenge/${challenge.id}`);
};

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs">
      
      {/* Image + Badge Lieu */}
      <div onClick={()=>challengeDetail()} className="relative h-40 w-full cursor-pointer">
        <Image
          src={challenge.image}
          alt={challenge.title}
          fill
          unoptimized
          className="object-cover"
        />

        {/* Badge Lieu */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-800 shadow">
          <MapPin className="w-3 h-3 text-orange-600" />
          {challenge.locationType}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-2 ">

        {/* Titre */}
        <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
          {challenge.title}
        </h3>

        {/* Publié par */}
        <Link
          href={`/profil-entreprise/${challenge.entrepriseId}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-orange-600 transition "
        >
          Publié par :
          <Image
            src={challenge.entrepriseLogo || "/default-avatar.jpg"}
            alt="Entreprise"
            width={20}
            height={20}
            className="rounded-full object-cover h-4 w-4"
          />
          <span className="truncate">
            <span className="font-medium">{challenge.entrepriseNom}</span>
          </span>
        </Link>

        {/* Catégories */}
     <div className="flex flex-row justify-start items-center overflow-x-auto gap-2 w-full scrollbar-hide">
  {challenge.categories.map((cat) => (
    <div
      key={cat}
      className="text-xs md:text-xs font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 whitespace-nowrap flex-shrink-0"
    >
      {cat}
    </div>
  ))}
</div>

        {/* Dates */}
        <div className="text-xs text-gray-700 space-y-1 border-b pb-2">
          <p className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-orange-600" />
            Du {challenge.startDate} au {challenge.endDate}
          </p>
          <p className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-red-500" />
            Inscriptions jusqu’au {challenge.inscriptionEnd}
          </p>
        </div>

        {/* Récompenses */}
        <div>
          <button
            onClick={() => setOpenRewards(!openRewards)}
            className="w-full flex justify-between items-center text-sm font-semibold uppercase text-gray-800"
          >
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-orange-600" />
              Récompenses
            </div>

            {openRewards ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {openRewards && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1 bg-orange-50 p-2 rounded-md border border-orange-100">
              {challenge.rewards.map((reward, index) => (
                <li key={index} className="list-disc list-inside">
                  {reward}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Participants */}
        <div className="flex justify-end items-baseline">
          <Users className="w-4 h-4 text-orange-600 mr-1" />
          <span className="text-xl font-extrabold text-orange-700">
            {challenge.participants}
          </span>
          <span className="text-xs text-gray-500 ml-1">inscrits</span>
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          <Link
            href={`/challenge/${challenge.id}`}
            className="flex-1 text-xs py-2 text-center font-medium rounded-lg border border-orange-700 text-orange-700 hover:bg-orange-700 hover:text-white transition"
          >
            Détails
          </Link>

          <Link
            href={`/challenge/${challenge.id}/participate`}
            className="flex-1 text-xs py-2 text-center font-medium rounded-lg bg-orange-700 text-white hover:bg-orange-800 transition flex items-center justify-center gap-1"
          >
            Participer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
