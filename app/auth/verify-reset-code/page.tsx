"use client";

import { useState } from "react";

export default function VerifyResetCode() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">

        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Vérification du code
        </h2>

        <p className="text-gray-600 text-center mt-3">
          Entrez le code que nous vous avons envoyé par email.
        </p>

        <div className="mt-6">
          <label className="block text-sm">Code de vérification</label>
          <input
            type="text"
            className="w-full mt-1 p-3 border rounded-lg text-center tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-6"
        >
          Vérifier
        </button>

        <p className="text-center text-sm mt-4">
          Vous n'avez pas reçu de code ?{" "}
          <a href="#" className="text-orange-500 font-medium underline">
            Renvoyer
          </a>
        </p>
      </div>
    </div>
  );
}
