import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Talent Innovant",
  description: "Une plateforme qui connecte les talents et les entreprises à travers des challenges d’innovation pour révéler les potentiels cachés et stimuler la créativité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
      style={{backgroundColor:'white!important'}}
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
