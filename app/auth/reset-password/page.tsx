"use client";

import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">

        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Nouveau mot de passe
        </h2>

        <p className="text-gray-600 text-center mt-3">
          Entrez votre nouveau mot de passe pour finaliser la réinitialisation.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full mt-1 p-3 border rounded-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>

        <button
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-6"
        >
          Réinitialiser
        </button>

        <p className="text-center text-sm mt-4">
          <a href="/auth/login" className="text-orange-500 underline">
            Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  );
}
