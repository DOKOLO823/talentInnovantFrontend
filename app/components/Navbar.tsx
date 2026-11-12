"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Bell,
  Settings,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import LocationModal from "./LocationModal";
import NotificationsDropdown from "../notification/NotificationsDropdown";
import SocialLinks from "./SocialLinks";
import PwaBar from "./pwa/PwaBar";
import PushOptInModal from "./pwa/PushOptInModal";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");
  const [userPP, setUserPP] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<string>("entreprise");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState(0);
  // pour voir l'etat des 2 modal qui ne doivent pas s'afficher en même temps (location et les notifications push)
  const [showLocationModal, setShowLocationModal] = useState(false);
  // etat pour hauteur de bouton de notifications push sur app
  const [pwaBarHeight, setPwaBarHeight] = useState(0);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Petite astuce pour forcer le rafraîchissement de l'image
  const [imgKey, setImgKey] = useState(Date.now());

  // notifications en mode dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const settingsPath =
    role === "talent" ? "/parametres-talent" : "/parametres-entreprise";

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        if (
          currentScrollY > lastScrollY &&
          currentScrollY > 50 &&
          !menuOpen &&
          userStatus != "entreprise"
        ) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, menuOpen, userStatus]);

  useEffect(() => {
    const syncAuth = () => {
      // On ajoute un tout petit délai pour être sûr que le localStorage est bien écrit
      setTimeout(() => {
        const authItem = localStorage.getItem("auth");
        if (authItem) {
          try {
            const authData = JSON.parse(authItem);
            const newPP = authData.user?.pp;

            if (newPP) {
              setUserPP(newPP);
              setImgKey(Date.now()); // Force le rafraîchissement
              setIsLoggedIn(true);
            }
          } catch (e) {
            console.error("Erreur parsing auth:", e);
          }
        }
      }, 50); // 50ms suffisent
    };

    window.addEventListener("local-storage-update", syncAuth);
    window.addEventListener("storage", syncAuth); // Pour les changements inter-onglets

    return () => {
      window.removeEventListener("local-storage-update", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    const authItem = localStorage.getItem("auth");
    if (authItem) {
      const authData = JSON.parse(authItem);
      // console.log(authData);
      if (authData.user?.pp) {
        setUserPP(authData.user.pp);
      }
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const authItem = localStorage.getItem("auth");
      if (!authItem) {
        setIsCheckingAuth(false);
        return;
      }

      if (authItem) {
        const authData = JSON.parse(authItem);
        if (authData.user?.pp) {
          setUserPP(authData.user.pp);
        }
        setIsLoggedIn(true);

        try {
          const res = await apiFetch("/user/info", { method: "GET" });

          if (res?.statut === 200) {
            const userData = res.data.user;
            setIsLoggedIn(true);
            setRole(userData.statut);
            setUserId(userData.id);
            setUserStatus(userData.statut);

            if (userData.pp !== userPP) {
              setUserPP(userData.pp);
              setImgKey(Date.now()); // Forcer le refresh ici aussi
              const authData = JSON.parse(localStorage.getItem("auth") || "{}");
              if (authData.user) {
                authData.user.pp = userData.pp;
                localStorage.setItem("auth", JSON.stringify(authData));
              }
            }

            const notifRes = await apiFetch("/notifications/nonlues", {
              method: "GET",
            });
            if (notifRes?.statut === 200)
              setNotificationCount(notifRes.unread_count);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Erreur auth:", error);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [userPP]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setRole("");
    setUserPP(null);
    setUserId(null);
    setIsLoggedIn(false);
    closeMenu();
    router.push("/auth/login");
  };

  // deconnecter toutes les sessions de mon compte sur tous les onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const cleared =
        (e.key === "auth" || e.key === null) && !localStorage.getItem("auth");
      if (cleared && !window.location.pathname.startsWith("/auth")) {
        window.location.replace("/auth/login");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const guestLinks = [
    { href: "/", label: "Accueil" },
    { href: "#challenges", label: "Challenges" },
    { href: "#entreprises", label: "Entreprises" },
  ];
  const pcTalentLinks = [
    { href: "/home-talent", label: "Accueil" },
    { href: "/mes-challenges", label: "Mes challenges" },
    { href: "/reseau", label: "Réseau" },
    { href: "/communaute", label: "Communauté" },
  ];

  const pcEntrepriseLinks = [{ href: "/home-entreprise", label: "Accueil" }];

  const navLinks =
    role == "talent"
      ? pcTalentLinks
      : role == "entreprise"
        ? pcEntrepriseLinks
        : guestLinks;

  const profileLink = userId
    ? role === "talent"
      ? `/profil-talent/${userId}`
      : `/profil-entreprise/${userId}`
    : "/auth/login";

  const pwaActive = isLoggedIn && !isCheckingAuth;

  return (
    <>
      <PwaBar
        isLoggedIn={pwaActive}
        userId={userId}
        onHeightChange={setPwaBarHeight}
      />

      <nav
        style={{
          top: Math.min(pwaBarHeight, Math.max(0, pwaBarHeight - lastScrollY)),
        }}
        className={`fixed left-0 w-full bg-white shadow-md z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-2">
          <div className="flex flex-row items-center justify-start flex-shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className={`py-2 px-1 rounded-md hover:bg-gray-100 transition md:hidden ${isLoggedIn && "mr-0"}`}
            >
              <Menu className="h-6 w-6 text-orange-700" />
            </button>
            <span className="text-[15px] sm:text-sm md:text-md font-extrabold tracking-tight whitespace-nowrap">
              <span className="inline xl:hidden"> T</span>{" "}
              <span className="hidden xl:inline">TALENT</span>{" "}
              <span className="text-orange-700 inline xl:hidden">I</span>
              <span className="text-orange-700 hidden xl:inline">INNOVANT</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            <div className="hidden md:flex space-x-6">
              {!isCheckingAuth &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium text-base transition pb-1 ${pathname === link.href ? "text-orange-700 border-b-2 border-orange-700" : "text-gray-700 hover:text-orange-600"}`}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>

            {/* NOUVEAU : réseaux sociaux (groupe WhatsApp masqué sur mobile) */}
            <SocialLinks
              variant="navbar"
              className="md:border-l md:border-gray-200 md:pl-4"
            />

            {!isCheckingAuth &&
              (isLoggedIn ? (
                <div className="flex items-center space-x-0 md:space-x-6">
                  {/* <Link
                    href={"/notification"}
                    onClick={() => setNotificationCount(0)}
                    className="relative cursor-pointer flex items-center justify-center p-1"
                  >
                    <Bell
                      className={`h-6 w-6 transition ${pathname === "/notification" ? "text-orange-700" : "text-gray-700 hover:text-orange-600"}`}
                    />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0.5 bg-orange-700 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white p-2">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </Link> */}

                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setNotifOpen((o) => !o);
                        if (!notifOpen) setNotificationCount(0);
                      }}
                      className="relative cursor-pointer flex items-center justify-center p-1"
                    >
                      <Bell
                        className={`h-6 w-6 transition ${notifOpen ? "text-orange-700" : "text-gray-700 hover:text-orange-600"}`}
                      />
                      {notificationCount > 0 && (
                        <span className="absolute top-0 right-0.5 bg-orange-700 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white p-2">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <NotificationsDropdown
                        onClose={() => setNotifOpen(false)}
                      />
                    )}
                  </div>

                  <Link
                    href={profileLink}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`relative w-8 h-8 sm:w-9 sm:h-9 overflow-hidden rounded-full border-1 ${pathname.includes(profileLink) ? "border-orange-700" : "border-gray-200"} transition group-hover:border-orange-500`}
                    >
                      <img
                        key={imgKey} // Ajoutez la key directement ici aussi
                        src={
                          userPP
                            ? userPP.startsWith("http")
                              ? `${userPP}?v=${imgKey}`
                              : `${apifile.replace(/\/$/, "")}/${userPP.replace(/^\//, "")}?v=${imgKey}`
                            : role === "talent"
                              ? "/assets/images/pp2.png"
                              : "/assets/images/ppe.png"
                        }
                        alt="Profil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const defaultImg =
                            role === "talent"
                              ? "/assets/images/pp2.png"
                              : "/assets/images/ppe.png";
                          if (
                            target.src !==
                            window.location.origin + defaultImg
                          ) {
                            target.src = defaultImg;
                          }
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium ${pathname.includes(profileLink) ? "text-orange-700" : "text-gray-500"} group-hover:text-orange-700 transition leading-tight mt-0.5`}
                    >
                      Mon profil
                    </span>
                  </Link>

                  <Link
                    href={settingsPath}
                    className="hidden md:flex flex-col items-center group"
                    title="Paramètres"
                  >
                    <Settings
                      className={`h-6 w-6 transition ${pathname === settingsPath ? "text-orange-700" : "text-gray-700 hover:text-orange-600"}`}
                    />
                    <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 group-hover:text-orange-700 transition leading-tight mt-0.5">
                      Paramètres
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center text-gray-500 hover:text-red-600 transition"
                    title="Déconnexion"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden md:inline-block px-4 py-2 bg-orange-700 text-[10px] md:text-xs text-center text-white rounded-md font-medium hover:bg-orange-600 transition"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/login"
                    className="md:hidden flex items-center text-center text-[10px] md:text-xs font-bold text-orange-700 border border-orange-700 px-2 py-1 rounded"
                  >
                    <LogIn className="h-3 w-3 mr-1" /> Se connecter
                  </Link>
                </>
              ))}
          </div>
        </div>
      </nav>

      <PushOptInModal isLoggedIn={isLoggedIn} blocked={showLocationModal} />

      {/* Menu Mobile */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${menuOpen ? "opacity-50" : "opacity-0 pointer-events-none"}`}
          onClick={closeMenu}
        ></div>
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 p-6 flex flex-col justify-between transition-transform duration-300 transform ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
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
              {!isLoggedIn && guestLinks.map(renderMobileLink)}

              {isLoggedIn && (
                <>
                  <li key="/parametres">
                    <Link
                      href={settingsPath}
                      onClick={closeMenu}
                      className={`flex items-center space-x-2 font-medium text-base transition ${pathname === settingsPath ? "text-orange-700 font-bold" : "text-gray-700"}`}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Paramètres</span>
                    </Link>
                  </li>

                  <li key="/contact">
                    <Link
                      href="/contact"
                      onClick={closeMenu}
                      className={`flex items-center space-x-2 font-medium text-base transition ${
                        pathname === "/contact"
                          ? "text-orange-700 font-bold"
                          : "text-gray-700 hover:text-orange-700"
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                      <span>Nous contacter</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* NOUVEAU : les 4 liens sociaux dans le menu mobile */}
            <div className="mt-8 pt-4 border-t">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Suivez-nous
              </p>
              <SocialLinks variant="drawer" />
            </div>
          </div>
          <div className="border-t pt-4 relative -top-20">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 font-medium w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Se déconnecter</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="flex items-center space-x-2 text-orange-600 font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isLoggedIn && role === "talent" && (
        <LocationModal onOpenChange={setShowLocationModal} />
      )}
    </>
  );

  function renderMobileLink(link: { href: string; label: string }) {
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          onClick={closeMenu}
          className={`block font-medium text-base transition ${pathname === link.href ? "text-orange-700 font-bold" : "text-gray-700"}`}
        >
          {link.label}
        </Link>
      </li>
    );
  }
}
