"use client";

import Sidebar from "../components/entreprise/Sidebar";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function HomeEntrepriseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Bouton Sidebar mobile indépendant */}
      <button
        className="fixed bottom-4 right-4 z-50 md:hidden p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition"
        onClick={() => setSidebarOpen(true)}
      >
        {/* Icône menu */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex pt-16">
        {/* Sidebar fixe */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Contenu principal */}
        <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
