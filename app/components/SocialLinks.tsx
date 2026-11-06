"use client";

import { Users } from "lucide-react";

/**
 * Emplacement conseillé : app/components/SocialLinks.tsx
 *
 * Variants :
 *  - "navbar" : petites icônes grises (le groupe WhatsApp est masqué sur mobile < 640px)
 *  - "drawer" : icônes avec bordure, pour le menu mobile (les 4 liens)
 *  - "footer" : pastilles rondes pour fond sombre (adapter les couleurs si le footer est clair)
 */

const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029Vb8ewAHCcW4iILNZWb39";
const FACEBOOK = "https://www.facebook.com/profile.php?id=61584370003120";
const LINKEDIN = "https://www.linkedin.com/company/talent-innovant/";
const WHATSAPP_GROUP = "https://chat.whatsapp.com/KZDescNoqkgKqREqCKg34Q";

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg {...svgProps} className={className} aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg {...svgProps} className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon({ className = "" }: { className?: string }) {
  return (
    <svg {...svgProps} className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SOCIALS = [
  {
    id: "whatsapp-channel",
    label: "Chaîne WhatsApp",
    href: WHATSAPP_CHANNEL,
    Icon: WhatsAppIcon,
    hover: "hover:text-green-600",
    hideOnMobile: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: FACEBOOK,
    Icon: FacebookIcon,
    hover: "hover:text-blue-600",
    hideOnMobile: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: LINKEDIN,
    Icon: LinkedInIcon,
    hover: "hover:text-sky-700",
    hideOnMobile: false,
  },
  {
    id: "whatsapp-group",
    label: "Groupe WhatsApp",
    href: WHATSAPP_GROUP,
    Icon: Users,
    hover: "hover:text-green-600",
    hideOnMobile: true, // masqué dans la navbar sur mobile
  },
];

export default function SocialLinks({
  variant = "navbar",
  className = "",
}: {
  variant?: "navbar" | "drawer" | "footer";
  className?: string;
}) {
  const containerGap = variant === "navbar" ? "gap-0.5 sm:gap-1.5" : "gap-3";

  return (
    <div className={`flex items-center ${containerGap} ${className}`}>
      {SOCIALS.map(({ id, label, href, Icon, hover, hideOnMobile }) => {
        const visibility =
          variant === "navbar" && hideOnMobile ? "hidden sm:flex" : "flex";

        const styles =
          variant === "navbar"
            ? ` p-1.5 rounded-full text-gray-600 hover:bg-gray-100 ${hover}`
            : variant === "drawer"
              ? `h-10 w-10 justify-center rounded-full border border-gray-200 text-gray-600 ${hover} hover:bg-gray-50`
              : "h-10 w-10 justify-center rounded-full bg-white/10 text-white hover:bg-orange-700";

        const iconSize =
          variant === "navbar" ? "h-[18px] w-[18px] sm:h-5 sm:w-5" : "h-5 w-5";

        return (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`${visibility} items-center transition ${styles}`}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
