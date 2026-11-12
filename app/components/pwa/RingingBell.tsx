"use client";

// Emplacement : app/components/pwa/RingingBell.tsx
// Cloche qui sonne brièvement toutes les ~3,5 s pour attirer l'œil.
// Désactivée automatiquement si l'utilisateur a demandé moins d'animations.

import { Bell } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function RingingBell({ size = 16 }: { size?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      style={{ display: "inline-flex", transformOrigin: "50% 0%" }}
      animate={
        reduceMotion ? undefined : { rotate: [0, 14, -12, 10, -8, 5, 0] }
      }
      transition={{
        duration: 1.1,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2.5,
      }}
    >
      <Bell size={size} />
    </motion.span>
  );
}
