"use client";

import { useState } from "react";
import { X, Copy } from "lucide-react";

interface Props {
  link: string;
  onClose: () => void;
}

export default function ModalSharePortfolio({ link, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    link
  )}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    link
  )}`;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Partager le portfolio</h2>

        <div className="flex flex-col gap-4">
          <a
            href={whatsappLink}
            target="_blank"
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-center hover:bg-green-600"
          >
            WhatsApp
          </a>

          <a
            href={facebookLink}
            target="_blank"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700"
          >
            Facebook
          </a>

          <button
            onClick={handleCopy}
            className="bg-gray-200 px-4 py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-300"
          >
            <Copy size={16} /> {copied ? "Copié !" : "Copier le lien"}
          </button>
        </div>
      </div>
    </div>
  );
}
