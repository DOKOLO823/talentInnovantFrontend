import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ConditionalLayout from "./components/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Talent Innovant",
  description:
    "Une plateforme qui connecte les talents et les entreprises à travers des challenges d'innovation pour révéler les potentiels cachés et stimuler la créativité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light" style={{ colorScheme: "light" }}>
      <head>
        {/* Le script le plus léger (Plausible standard) */}
        {/* 1. Le script principal (chargement asynchrone) */}
        <Script
          async
          src="https://plausible.io/js/pa-uLE2cMjjUniEqBVE--pha.js"
          strategy="afterInteractive"
        />
      </head>

      <body style={{ backgroundColor: "white" }}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
            <Toaster containerStyle={{ zIndex: 999999999 }} />
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
