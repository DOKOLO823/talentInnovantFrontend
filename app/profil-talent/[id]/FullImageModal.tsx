"use client";

import { X } from "lucide-react";

export default function FullImageModal({ src, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white"
      >
        <X size={32} />
      </button>

      <img
        src={src}
        className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
      />
    </div>
  );
}
