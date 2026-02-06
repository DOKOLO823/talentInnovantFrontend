import React, { useState } from 'react';

interface ReadMoreProps {
  text: string;
  limit?: number;
}

const ReadMore = ({ text, limit = 65 }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  // Si le texte est court, on l'affiche simplement
  if (text.length <= limit) {
    return (
      <p className="text-sm text-gray-300 italic text-center leading-relaxed px-2">
        "{text}"
      </p>
    );
  }

  return (
    <div className="text-start px-2">
      <p className="text-sm text-gray-300 italic leading-relaxed inline">
        "{isExpanded ? text : `${text.substring(0, limit)}...`}"
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="ml-2 text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 transition-colors underline decoration-orange-500/30 underline-offset-4"
      >
        {isExpanded ? "Réduire" : "Lire la suite"}
      </button>
    </div>
  );
};

export default ReadMore;