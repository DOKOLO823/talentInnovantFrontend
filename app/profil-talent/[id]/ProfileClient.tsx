"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FullImageModal from "./FullImageModal";
import TabsAbout from "./TabsAbout";
import TabsProjects from "./TabsProjects";
import TabsPortfolio from "./TabsPortfolio";
import BackButton from "@/app/components/BackButton";
import Navbar from "@/app/components/Navbar";
import BottomBar from "@/app/components/BottomBar";

export default function ProfileClient({ user, projects, portfolio }: any) {
  const [showPP, setShowPP] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="w-full">
      <Navbar/>
 <BackButton m={16} />
      {/* ================= COVER ================= */}
      <div className="w-full h-56 md:h-72 relative">
        <Image
          src={user.cover || "/default-cover.jpg"}
          fill
          className="object-cover"
          alt="cover"
        />
      </div>

      {/* ================= PHOTO + INFOS ================= */}
      <div className="px-4 md:px-8 -mt-20 relative">
        <div className="flex flex-col items-center md:items-start gap-4">

          {/* PHOTO PROFIL — NE SE RÉDUIT PAS */}
          <div
            className="w-36 h-36 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl cursor-pointer"
            onClick={() => setShowPP(true)}
          >
            <img
              src={user.avatar}
              className="object-cover w-full h-full"
            />
          </div>

          {/* INFOS EN COLONNE */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.profession}</p>
            <p className="text-gray-500 mt-1 max-w-xl">{user.bio}</p>
          </div>

          {/* BOUTON EDIT — TOUJOURS EN-DESSOUS EN COLONNE */}
          <Link
            href={`/profil-talent/edit/1`}
            className="bg-orange-700 text-white px-5 py-2 rounded-lg shadow hover:bg-orange-800"
          >
            Modifier le profil
          </Link>
        </div>
      </div>

      {/* ================= FULLSCREEN PHOTO ================= */}
      {showPP && (
        <FullImageModal
          src={user.avatar}
          onClose={() => setShowPP(false)}
        />
      )}

      {/* ================= TABS (STICKY) ================= */}
      <div
        className="
          px-4 md:px-8 
          mt-6 
          border-b 
          flex gap-6 
          bg-white 
          sticky top-0 z-50
          pt-4
        "
      >
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
          onClick={() => setActiveTab("projects")}
          className={`pb-3 border-b-2 ${
            activeTab === "projects"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          Projets
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`pb-3 border-b-2 ${
            activeTab === "portfolio"
              ? "border-orange-700 text-orange-700 font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          Portfolio
        </button>
      </div>

      {/* ================= CONTENT TABS ================= */}
      <div className="px-4 md:px-8 mt-6 pb-14">
        {activeTab === "about" && <TabsAbout user={user} />}
        {activeTab === "projects" && <TabsProjects />}
        {activeTab === "portfolio" && <TabsPortfolio />}
      </div>

      <BottomBar/>
    </div>
  );
}
