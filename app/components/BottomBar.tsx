// components/BottomBar.tsx

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Bell, Briefcase } from "lucide-react";

type UserRole = 'talent' | 'entreprise' | 'guest';

export default function BottomBar() {
  const pathname = usePathname();

  const [role, setRole] = useState<UserRole | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // 🔥 Nouveau compteur pour opportunités non lues
  const [opportuniteCount, setOpportuniteCount] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchedRole: UserRole = 'talent';
      const fetchedNotifications = 5;

      // 🔥 Fake data opportunités non lues
      const fetchedOpportunites = 7;

      setRole(fetchedRole);
      setNotificationCount(fetchedNotifications);
      setOpportuniteCount(fetchedOpportunites);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (role === null) return null;
  if (role !== 'talent') return null;

  const navItems = [
    { 
      href: "/home-talent", 
      label: "Accueil", 
      Icon: Home 
    },
    { 
      href: "/notification", 
      label: "Notifications", 
      Icon: Bell, 
      badge: notificationCount,
    },
    { 
      href: "/opportunite", 
      label: "Opportunités", 
      Icon: Briefcase,
      badge: opportuniteCount, // 🔥 Badge ajouté ici
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl md:hidden z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const iconColor = isActive ? "text-orange-700" : "text-gray-500";
          const labelColor = isActive ? "text-orange-700" : "text-gray-600";

          return (
            <Link 
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 pt-1.5 w-full h-full hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <item.Icon className={`w-6 h-6 ${iconColor}`} />

                {/* 🔥 Pastille pour Notification + Opportunités */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-xs mt-0.5 font-medium ${labelColor}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
