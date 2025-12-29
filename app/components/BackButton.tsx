"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label = "Retour", m=20 }: { label?: string; m?: number }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center px-4 rounded-lg border border-gray-300 cursor-pointer gap-2 py-2
                  
                 transition-all text-gray-700 font-medium w-fit mt-${m} mb-4`}
    >
      <ArrowLeft size={24} className="text-orange-700" />
      {/* {label} */}
    </button>
  );
}
