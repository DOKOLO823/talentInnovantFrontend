"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Gérer l'affichage du bouton en fonction du scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {showBackToTop && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-50 p-2 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-orange-300 border-none cursor-pointer"
          aria-label="Retour en haut de page"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}