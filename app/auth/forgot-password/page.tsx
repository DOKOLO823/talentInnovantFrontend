"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Mot de passe oublié
        </h2>

        <p className="text-gray-600 text-center mt-3">
          Entrez votre adresse email. Nous vous enverrons un code de réinitialisation.
        </p>

        <div className="mt-6">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-6"
        >
          Envoyer le code
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
