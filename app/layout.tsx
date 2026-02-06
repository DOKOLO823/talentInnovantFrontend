import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ConditionalLayout from "./components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Talent Innovant",
  description: "Une plateforme qui connecte les talents et les entreprises à travers des challenges d'innovation pour révéler les potentiels cachés et stimuler la créativité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light" style={{ colorScheme: 'light' }}>
      <body style={{backgroundColor:'white'}}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
            <Toaster position="top-right" containerStyle={{zIndex: 999999999}} />
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}