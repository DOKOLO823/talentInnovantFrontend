// Emplacement : app/communaute/components/common/BrandIcons.tsx
// Icônes de partage aux couleurs des marques (aucune dépendance externe).

import { Link2 } from "lucide-react";

export function WhatsAppIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      <g
        transform="translate(10 10) scale(1.17)"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </g>
    </svg>
  );
}

export function FacebookIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#1877F2" />
      <path
        transform="translate(8 7) scale(1.33)"
        fill="#fff"
        d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.46c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.4-3.9 4v2.16H7.7v3h2.66V21h3.14z"
      />
    </svg>
  );
}

export function CopyLinkIcon({ size = 56 }: { size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-slate-800 text-white"
    >
      <Link2 size={size * 0.46} />
    </span>
  );
}
