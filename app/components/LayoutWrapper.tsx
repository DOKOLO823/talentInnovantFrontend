'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomBar from './BottomBar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 1. Routes Statiques (Exactes ou commençant par...)
  const hideLayoutRoutes = [
    '/auth/login',
    '/auth/register-company',
    '/auth/register-talent',
    '/auth/verify-email',
    '/auth/email-checking'
  ];

  // 2. Vérification des routes statiques
  const isStaticHidden = hideLayoutRoutes.some(route => pathname.startsWith(route));

  // 3. Vérification de la route dynamique /challenge/[id]/reel
  // On vérifie si le chemin commence par "/challenge/" ET se termine par "/reel"
  const isChallengeReel = pathname.startsWith('/challenge/') && pathname.endsWith('/reel');

  const isChallengeReelProfil = pathname.startsWith('/challenge/') && pathname.endsWith('/reel-profil');

  const isPortfolio = pathname.startsWith('/portfolio/');

  const isMonCv = pathname.startsWith('/moncv/');

  const isEditChallenge = pathname.startsWith('/challenge/edit/');

  const shouldHideLayout = isStaticHidden || isChallengeReel || isChallengeReelProfil || isPortfolio || isMonCv || isEditChallenge;

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!shouldHideLayout && <BottomBar />}
    </>
  );
}