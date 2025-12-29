"use client";

import { useState } from "react";
import { Heart, Calendar, ArrowRight, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function OpportuniteCard({ opp }: any) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(opp.like || 0);
  const [openMenu, setOpenMenu] = useState(false);

  const toggleLike = () => {
    setLikes((l: number) => (liked ? l - 1 : l + 1));
    setLiked(!liked);
  };

  return (
    <div className="relative bg-white border rounded-xl shadow-sm p-4 max-w-[400px] flex flex-col">

      {/* BOUTON 3 POINTS */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="p-1 rounded-full hover:bg-gray-200 transition"
        >
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-lg overflow-hidden z-20">
            <Link
              href={`/opportunite/edit/${opp.id}`}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Modifier
            </Link>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* ENTÊTE ENTREPRISE */}
      <Link href={`/profil-entreprise/${opp.entreprise?.id || 1}`} className="flex items-center gap-3 mb-3 pr-8">
        <Image
          src={opp.entreprise?.logo}
          width={40}
          height={40}
          alt={opp.entreprise?.nom || "entreprise"}
          className="rounded-full object-cover border h-10 w-10"
        />
        <div>
          <p className="font-semibold">{opp.entreprise?.nom}</p>
          <p className="text-xs text-gray-500">{opp.domaine}</p>
        </div>
      </Link>

      {/* TITRE + TYPE */}
      <h3 className="text-lg font-semibold">{opp.titre}</h3>
      <p className="text-gray-600 text-sm">{opp.type}</p>

      {/* DESCRIPTION */}
      <p className="mt-3 text-gray-700 text-sm line-clamp-3">
        {opp.description}
      </p>

      {/* DATE LIMITE */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
        <Calendar size={16} className="text-orange-700" />
       <div className="flex flex-row justify-center items-center gap-x-2">
         <span>Date limite : {opp.date_limite} </span> <span className="text-red-700">(expire)</span>
       </div>
      </div>

      {/* LIKE */}
      <button
        onClick={toggleLike}
        className="mt-3 flex items-center gap-2 text-sm font-medium w-fit"
      >
        <Heart
          size={20}
          className={`transition ${
            liked ? "fill-orange-700 text-orange-700" : "text-gray-600"
          }`}
        />
        <span className={liked ? "text-orange-700" : "text-gray-700"}>
          {likes} likes
        </span>
      </button>

      {/* LIEN */}
      <a
        href={opp.lien}
        target="_blank"
        className="mt-4 text-orange-700 hover:underline flex items-center gap-1 font-medium"
      >
        Voir plus <ArrowRight size={16} />
      </a>
    </div>
  );
}
