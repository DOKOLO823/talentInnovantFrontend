"use client";

import Sidebar from "../components/entreprise/Sidebar";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

export default function HomeEntrepriseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fixée en haut de l'écran */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <Navbar />
      </div>


      <button
        className="fixed bottom-4 right-4 z-50 md:hidden p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 transition"
        onClick={() => setSidebarOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-hidden">
          {/* <Toaster/> */}
          {children}
        </main>
      </div>
    </div>
  );
}