"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Flag, Users, Building2, Briefcase, Mail, ChevronDown, X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (b: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [dropdown, setDropdown] = useState(false);
  const pathname = usePathname();

  const menu = [
    { href: "/home-entreprise", label: "Accueil", Icon: Home },
    { href: "/home-entreprise/Challenges", label: "Challenges", Icon: Flag },
    { href: "/home-entreprise/Talents", label: "Les talents", Icon: Users },
    { href: "/home-entreprise/Entreprises", label: "Les entreprises", Icon: Building2 },
    { href: "/home-entreprise/Opportunites", label: "Opportunités", Icon: Briefcase },
  ];

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar fixe */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-white border-r b-gray-100 flex flex-col transition-transform transform
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-4 shadow flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden z-100">
            <Image
              src="../assets/images/award.jpg"
              alt="logo"
              width={50}
              height={50}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <p className="font-bold text-sm">Mon Entreprise</p>
            <p className="text-xs text-gray-500">Tableau</p>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menu.map((m) => {
            const isActive = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition
                  ${isActive ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-700"}`}
              >
                <m.Icon className={`w-5 h-5 ${isActive ? "text-orange-700" : "text-gray-600"}`} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bas fixe */}
        <div className="p-4 flex-shrink-0 mt-auto">
          <Link
            href="/home-entreprise/contact"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 text-gray-700"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            Nous contacter
          </Link>

          <button
            className="w-full flex items-center gap-3 justify-between p-2 rounded hover:bg-gray-100 mt-2"
            onClick={() => setDropdown(!dropdown)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                E
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Mon Entreprise</p>
                <p className="text-xs text-gray-500">Compte</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 transition ${dropdown ? "rotate-180" : ""}`} />
          </button>

          {dropdown && (
            <div className="mt-3 space-y-2">
              <Link href="/auth/login" className="block text-sm text-red-600">
                Se déconnecter
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
