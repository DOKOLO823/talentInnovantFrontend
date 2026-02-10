"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Search,
  Trophy,
  User,
  Crown,
  Medal,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import BackButton from "@/app/components/BackButton";
import Link from "next/link";
import BackToTop from "@/app/components/BackToTop";

export default function TousLesTalents() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const res = await apiFetch("/talents/tous", { method: "GET" });
        if (res?.statut === 200) {
          const mapped = res.tous.map((t: any) => ({
            id: t.user_id,
            name: `${t.nom} ${t.prenom || ""}`,
            points: t.point || 0,
            rang: t.rang,
            profession: t.profession || "Innovateur",
            nombre_projets: t.nombre_projets || 0,
            avatar: t.user?.pp
              ? `${apifile}/${t.user.pp}`
              : "/assets/images/pp2.png",
          }));
          setTalents(mapped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTalents();
  }, [token]);

  const filteredTalents = talents.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackButton m={16} />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tous les Talents
          </h1>
          <p className="text-gray-500 mt-1">
            Les élites de l'innovation réunies au même endroit.
          </p>

          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un talent..."
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
            {filteredTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="text-center">
                  <Link
                    href={`/profil-talent/${talent.id}`}
                    className="relative inline-block mb-3"
                  >
                    <img
                      src={talent.avatar}
                      alt=""
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-sm group-hover:border-orange-50"
                    />
                  </Link>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-lg truncate">
                    {talent.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {talent.profession}
                  </p>

                  <div className="flex flex-col mb-2">
                    <div className="flex items-center justify-center gap-1 text-orange-700 py-1 rounded-lg">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {talent.points} pts
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 bg-gray-50 py-1 rounded-lg border border-gray-100">
                      {talent.rang}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/profil-talent/${talent.id}`)}
                    className="w-full py-2 bg-white border border-orange-700 text-orange-700 text-xs font-bold rounded-xl hover:bg-orange-700 hover:text-white transition-all"
                  >
                    Profil
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
