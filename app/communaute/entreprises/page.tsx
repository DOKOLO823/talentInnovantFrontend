"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Search,
  Building2,
  Crown,
  Medal,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "@/app/components/BackButton";
import BackToTop from "@/app/components/BackToTop";

export default function ToutesLesEntreprises() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiFetch("/entreprises/tous", { method: "GET" });
        if (res?.statut === 200) {
          setCompanies(res.tous);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [token]);

  const filtered = companies.filter((c) =>
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackButton m={16} />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Toutes les Entreprises
          </h1>
          <p className="text-gray-500 mt-1">
            Partenaires de vos ambitions et de vos futurs succès.
          </p>

          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-orange-700" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div
                  className="cursor-pointer text-center"
                  onClick={() =>
                    router.push(`/profil-entreprise/${company.user_id}`)
                  }
                >
                  <img
                    src={
                      company.user?.pp
                        ? `${apifile}/${company.user.pp}`
                        : "/assets/images/ppe.png"
                    }
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto object-cover border-2 border-gray-50 shadow-sm mb-4"
                  />

                  <h3 className="font-bold line-clamp-1 gap-x-0.5 text-gray-900 text-sm sm:text-lg group-hover:text-orange-700 transition-colors">
                    {company?.nom}
                  </h3>

                  {/* Badge de certification Orange-700 */}
                  <div className="w-full flex flex-col justify-center items-center">
                    {(company?.user?.certifie === 1 ||
                      company?.user?.certifie === true) && (
                      <CheckCircle2
                        className="w-3 h-3 text-orange-700 fill-orange-700/10 flex-shrink-0"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center my-2">
                    <span className="text-[10px] font-bold px-2 text-orange-700 rounded-lg">
                      {company.rang}
                    </span>
                    <span className="text-[10px] font-medium px-2 pb-1 bg-gray-50 text-gray-500 rounded-lg">
                      {company.point} pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(`/profil-entreprise/${company.user_id}`)
                  }
                  className="mt-auto w-full py-2.5 bg-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-800 transition-all active:scale-95"
                >
                  Voir
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
