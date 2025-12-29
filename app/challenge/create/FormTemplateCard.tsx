"use client";

export default function FormTemplateCard({ template, onUse }: any) {
  return (
    <div className="border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col h-[400px]">
      
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">{template.title}</h3>
        <p className="text-xs text-gray-500">{template.description}</p>
      </div>

      {/* Scroll interne */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-orange-300">
        {template.fields.map((f: any, i: number) => (
          <div
            key={i}
            className="text-md bg-gray-100 rounded-md px-2 py-1"
          >
            {f.label}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={onUse}
          className="w-full bg-orange-700 text-white text-sm py-2 rounded-lg hover:bg-orange-800 transition"
        >
          Utiliser ce modèle
        </button>
      </div>
    </div>
  );
}
