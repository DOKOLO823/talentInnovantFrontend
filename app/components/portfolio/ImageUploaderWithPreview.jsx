"use client";
import React, { useState } from "react";

export default function ImageUploaderWithPreview({ onChange }) {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);
    if (onChange) onChange(files);
  };

  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    if (onChange) onChange(updated.map((p) => p.file));
  };

  return (
    <div className="space-y-3">
      <label className="font-medium">Images du projet</label>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border rounded p-2"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {previews.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img.url}
                alt="preview"
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded px-1"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
