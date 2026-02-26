"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Bell, Users, Network } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

export default function BottomBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [reseauCount, setReseauCount] = useState<number>(0);

  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingReseau, setLoadingReseau] = useState(true);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const authItem = localStorage.getItem("auth");
    if (authItem) {
      const authData = JSON.parse(authItem);
      setRole(authData.user?.statut || "guest");

      apiFetch("/notifications/nonlues", { method: "GET" })
        .then((res) => {
          if (res?.statut === 200) setNotificationCount(res.unread_count);
        })
        .finally(() => setLoadingNotifs(false));

      apiFetch("/reseau/notifications/count", { method: "GET" })
        .then((res) => {
          if (res?.statut === 200) setReseauCount(res.nombre);
        })
        .finally(() => setLoadingReseau(false));
    }
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  if (role !== "talent") return null;

  const navItems = [
    {
      href: "/home-talent",
      label: "Accueil",
      Icon: Home,
    },
    {
      href: "/notification",
      label: "Notifications",
      Icon: Bell,
      badge: notificationCount,
      isLoading: loadingNotifs,
    },
    {
      href: "/communaute",
      label: "Communauté",
      Icon: Users,
    },
    {
      href: "/reseau",
      label: "Réseau",
      Icon: Network,
      badge: reseauCount,
      isLoading: loadingReseau,
      // On définit les routes secondaires qui activent cet onglet
      activeOn: ["/reseau", "/collaborateurs"],
    },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl md:hidden z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          // --- LOGIQUE DE L'ÉTAT ACTIF MODIFIÉE ---
          const isActive = item.activeOn
            ? item.activeOn.includes(pathname)
            : pathname === item.href;

          const showBadge =
            item.badge !== undefined && !item.isLoading && item.badge > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.label === "Notifications") setNotificationCount(0);
                if (item.label === "Réseau") setReseauCount(0);
              }}
              className="flex flex-col items-center justify-center p-2 pt-1.5 w-full h-full hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <item.Icon
                  className={`w-6 h-6 transition-colors ${isActive ? "text-orange-700" : "text-gray-500"}`}
                />

                {showBadge && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {item.badge! > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? "text-orange-700" : "text-gray-600"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
