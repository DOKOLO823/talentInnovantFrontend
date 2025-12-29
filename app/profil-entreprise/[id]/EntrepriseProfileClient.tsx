"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ChallengeCard from "@/app/components/ChallengeCard";
import { OpportuniteCard } from "@/app/components/opportunite/OpportuniteCard";
import BackButton from "@/app/components/BackButton";
import Navbar from "@/app/components/Navbar";
import BottomBar from "@/app/components/BottomBar";

// ===========================================
// CARD D’OPPORTUNITÉ
// ===========================================

// ===========================================
// PAGE PROFIL ENTREPRISE
// ===========================================
export default function EntrepriseProfileClient({
  entreprise,
  challenges,
  opportunites,
}: any) {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="w-full">
      <Navbar/>
      <BackButton m={16} />
      {/* ================= COVER ================= */}
      <div className="w-full h-56 md:h-72 relative mt-2">
        <Image
          src={entreprise.cover}
          fill
          className="object-cover"
          alt="cover"
        />
      </div>

      {/* ================= PHOTO + INFOS ================= */}
      <div className="px-4 md:px-8 -mt-20 relative">
        <div className="flex flex-col items-center md:items-start gap-4">

          {/* LOGO ENTREPRISE */}
          <div className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl">
            <img src={entreprise.avatar} className="object-cover w-full h-full" />
          </div>

          {/* INFOS */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{entreprise.name}</h1>
            <p className="text-gray-600 text-lg">{entreprise.service}</p>
          </div>

          {/* BOUTON EDIT */}
          <Link
            href={`/profil-entreprise/edit/1`}
            className="bg-orange-700 text-white px-5 py-2 rounded-lg shadow hover:bg-orange-800"
          >
            Modifier le profil
          </Link>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="px-4 md:px-8 mt-6 border-b flex gap-6 bg-white sticky top-0 z-50 pt-4">
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-3 border-b-2 ${
            activeTab === "about"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          À propos
        </button>

        <button
          onClick={() => setActiveTab("challenges")}
          className={`pb-3 border-b-2 ${
            activeTab === "challenges"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          Challenges
        </button>

        <button
          onClick={() => setActiveTab("opportunites")}
          className={`pb-3 border-b-2 ${
            activeTab === "opportunites"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          Offres d’opportunités
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 md:px-8 mt-6 pb-14">

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="space-y-4 mb-12">
            <h3 className="text-xl font-bold">Description</h3>
            <p className="text-gray-700">{entreprise.description}</p>

            <h3 className="text-xl font-bold mt-4">Services</h3>
            <p className="text-gray-700">{entreprise.service}</p>

            <h3 className="text-xl font-bold mt-4">Horaires</h3>
            <p className="text-gray-700">{entreprise.horaires}</p>

            <h3 className="text-xl font-bold mt-4">Site Web</h3>
            <a
              href={entreprise.siteWeb}
              target="_blank"
              className="text-orange-700 hover:underline"
            >
              {entreprise.siteWeb}
            </a>

            <h3 className="text-xl font-bold mt-4">Points</h3>
            <p className="text-orange-700 font-semibold text-lg">
              {entreprise.points} pts
            </p>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === "challenges" && (
          <div className="flex flex-wrap gap-6 mb-12">
            {challenges.map((ch: any) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))}
          </div>
        )}

        {/* OPPORTUNITÉS TAB */}
        {activeTab === "opportunites" && (
          <div className="flex flex-wrap gap-6 mb-12">
            {opportunites.map((opp: any) => (
              <OpportuniteCard key={opp.id} opp={opp} />
            ))}
          </div>
        )}
      </div>

      <BottomBar/>
    </div>
  );
}
