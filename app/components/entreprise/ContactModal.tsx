// components/entreprise/ContactModal.tsx
"use client";

export default function ContactModal({ talent, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-4">
          <img src={talent.avatar} alt={talent.name} className="w-20 h-20 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold">{talent.name}</h3>
            <p className="text-sm text-gray-500">{talent.profession}</p>
            <p className="text-sm mt-2">Tél: <strong>+237 6X XX XX XX</strong></p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Fermer</button>
          <a href={`tel:+237600000000`} className="px-4 py-2 rounded bg-orange-700 text-white">Appeler</a>
        </div>
      </div>
    </div>
  );
}
