"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { Menu, X, Heart, User, LogOut, LogIn, Bell } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Pour détecter la route active
  
  const [role, setRole] = useState<string>('');
  const [memoire, setMemoire] = useState<boolean | string>(false);
  
  useEffect(() => {
    const authItem = localStorage.getItem("auth");
    if (authItem) {
      setMemoire(true);
      try {
        const authData = JSON.parse(authItem);
        if (authData.user?.statut) setRole(authData.user.statut);
      } catch (err) {
        console.error("Erreur parsing auth", err);
      }
    }else {
      setMemoire(false);
      setRole('');
    }
  }, []);

  const isLoggedIn = memoire ? true : false;
  const notificationCount = 3;

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setRole('');
    closeMenu();
    router.push("/auth/login");
  };

  const guestLinks = [
    { href: "/", label: "Accueil" },
    { href: "#challenges", label: "Challenges" },
    { href: "#entreprises", label: "Entreprises" },
  ];
  
  const talentLinks = [
    { href: "/home-talent", label: "Accueil" },
    { href: "/opportunite", label: "Opportunités" },
  ];

  const navLinks = role === 'talent' ? talentLinks : guestLinks;
  
  const profileLink = 
    role === 'talent' ? "/profil-talent/1" :
    role === 'entreprise' ? "/profil-entreprise/1" :
    "/auth/login"; 
    
  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
          
          <div className="flex flex-row items-center justify-start">
            <button
              onClick={() => setMenuOpen(true)}
              className={`p-2 rounded-md hover:bg-gray-100 transition md:hidden ${isLoggedIn && 'mr-4'}`}
            >
              <Menu className="h-6 w-6 text-orange-700" />
            </button>

            <span className="md:text-lg text-md font-bold tracking-wide">
              TALENT <span className="text-orange-700">INNOVANT</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6">
              {role !== 'entreprise' && navLinks.map((link) => {
                // Vérification si le lien est actif
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={`font-medium text-base transition cursor-pointer pb-1 ${
                      isActive
                        ? 'text-orange-700 border-b-2 border-orange-700'
                        : 'text-gray-700 hover:text-orange-600 hover:border-b-2 hover:border-orange-600/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {isLoggedIn && (
              <div className="flex items-center space-x-5">
                {/* Notification : active si le pathname est /notification */}
                <Link href={'/notification'} className="hidden md:block relative cursor-pointer">
                  <Bell className={`h-6 w-6 transition ${pathname === '/notification' ? 'text-orange-700' : 'text-gray-700 hover:text-orange-600'}`} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                <Link href={profileLink}> 
                  <User className={`h-7 w-7 transition ${pathname.startsWith('/profil') ? 'text-orange-700' : 'text-gray-700 hover:text-orange-600'}`} />
                </Link>

                {role === 'talent' && (
                  <button 
                    onClick={handleLogout}
                    className="hidden md:flex items-center text-gray-700 hover:text-red-600 transition"
                    title="Déconnexion"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}
            
            {!isLoggedIn && (
              <Link
                href="/auth/login" 
                className="hidden md:inline-block px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="md:hidden"> 
        <div
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
            menuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeMenu}
        ></div>

        <div 
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 p-6 flex flex-col justify-between transition-transform duration-300 transform 
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-orange-700">Menu</h2>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md hover:bg-gray-100 transition"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <ul className="space-y-4">
              {isLoggedIn && role === 'talent' && talentLinks.map(renderMobileLink)}
              {!isLoggedIn && guestLinks.map(renderMobileLink)}
              {isLoggedIn && (
                <li key="/notification" className="md:hidden">
                   <Link
                    href="/notification"
                    onClick={closeMenu}
                    className={`block font-medium text-base transition ${pathname === '/notification' ? 'text-orange-700 font-bold' : 'text-gray-700'}`}
                  >
                    Notifications ({notificationCount})
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="border-t pt-4 relative -top-24">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Se déconnecter</span>
              </button>
            ) : (
              <Link
                href="/auth/login" 
                onClick={closeMenu}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );

  function renderMobileLink(link: { href: string; label: string }) {
      const isActive = pathname === link.href;
      return (
          <li key={link.href}>
              <Link
                  href={link.href}
                  onClick={closeMenu} 
                  className={`block font-medium text-base transition ${
                      isActive 
                          ? 'text-orange-700 font-bold' 
                          : 'hover:text-orange-600 text-gray-700'
                  }`}
              >
                  {link.label}
              </Link>
          </li>
      );
  }
}