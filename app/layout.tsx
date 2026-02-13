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
      <body style={{ backgroundColor: "white" }}>
        <Script
          async
          defer
          data-domain="talentinnovant.com"
          src="https://plausible.io/js/pa-uLE2cMjjUniEqBVE--pha.js"
          strategy="afterInteractive"
        />

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
