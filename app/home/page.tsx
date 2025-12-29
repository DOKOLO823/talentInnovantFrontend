"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Code,
  DollarSign,
  Users,
  CheckCircle,
  Briefcase,
  Zap,
  Compass,
  MessageCircle,
  Phone,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import TopChallengesList from "../components/TopChallengesList";
import FiltreChallenge from "../components/recherche/FiltreChallenge";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const CONTACT_PHONE = "+237 655 62 41 68";
const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/KZDescNoqkgKqREqCKg34Q?mode=ems_copy_t";

interface AdvantageCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  bgColor?: string;
}

interface HowItWorksStepProps {
  step: string;
  title: string;
  description: string;
}

export default function Home() {
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {/* ===================== HERO ===================== */}
      <section className="bg-white py-10 md:py-24 border-b border-gray-50">
  <div className="max-w-7xl mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
    
    {/* Contenu - Centré sur mobile, Gauche sur desktop */}
    <div className="space-y-5 text-center md:text-left">
      <div className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider">
        Le Hub de l'innovation
      </div>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
        <span className="text-orange-700">TALENT INNOVANT</span>, révélez votre potentiel à travers des challenges d'innovation !
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
        Connectez les talents et les entreprises à travers des challenges d’innovation pour stimuler la créativité.
      </p>

      {/* Boutons - Côte à côte sur mobile pour gagner de la place */}
      <div className="grid grid-cols-1 sm:flex sm:flex-row gap-3 pt-2">
        <Link
          href="/auth/register-talent"
          className="inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-semibold rounded-xl text-white bg-orange-700 hover:bg-orange-800 transition-all shadow-md active:scale-95"
        >
          S'inscrire comme talent
        </Link>
        <Link
          href="/auth/register-company"
          className="inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:border-orange-700 hover:text-orange-700 transition-all active:scale-95"
        >
          Espace Entreprise
        </Link>
      </div>
    </div>

    {/* Image droite - Masquée sur mobile pour un rendu plus court, ou affichée plus petite */}
    <div className="hidden md:block relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl">
      <Image
        src="/assets/images/innov.jpg"
        alt="Innovation Hub"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 600px"
      />
    </div>
  </div>
</section>
        {/* ===================== RECHERCHE ===================== */}
        <FiltreChallenge/>

        {/* ===================== TOP CHALLENGES ===================== */}
        <section id="challenges" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="md:text-2xl md:text-3xl font-bold text-gray-900 mb-5 border-l-4 border-orange-700 pl-3">
              Les top challenges du moment
            </h2>
            <TopChallengesList />
          </div>
        </section>

        {/* ===================== AVANTAGES TALENT ===================== */}
        <section
          id="avantages-talent"
          className="relative py-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("./assets/images/award.jpg")` }}
        >
          <div className="absolute inset-0 bg-[#0000008f] bg-opacity-60"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-12">
              Pourquoi nous rejoindre en tant que{" "}
              <span className="text-orange-500">Talent&nbsp;?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Code,
                  title: "Révélez votre potentiel",
                  desc: "Mettez vos compétences à l’épreuve sur des cas réels d’entreprise et faites-vous remarquer.",
                },
                {
                  icon: Briefcase,
                  title: "Découvrez des opportunités",
                  desc: "Les challenges mènent souvent à des stages, des emplois ou des collaborations d’affaires.",
                },
                {
                  icon: Zap,
                  title: "Stimulez votre créativité",
                  desc: "Travaillez sur des projets innovants et variés qui repoussent les limites du possible.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-orange-500/20 rounded-full">
                      <item.icon className="w-10 h-10 text-orange-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-14">
              <Link
                href="auth/register-talent"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg transform hover:scale-105 w-full sm:w-auto"
              >
                Je deviens un Talent Innovant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

      {/* ===================== AVANTAGES ENTREPRISE ===================== */}
<section
  id="entreprises"
  className="relative py-20 bg-cover bg-center bg-no-repeat mt-16"
  style={{ backgroundImage: `url("./assets/images/ets.jpg")` }} // → Mets une belle image business / corporate
>
  {/* Overlay sombre */}
  <div className="absolute inset-0 bg-[#00000080] bg-opacity-60"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-12">
      Pourquoi collaborer en tant qu’{" "}
      <span className="text-orange-500">Entreprise&nbsp;?</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          icon: Users,
          title: "Accès à des talents ciblés",
          desc: "Trouvez rapidement des profils qualifiés adaptés à vos besoins métiers.",
        },
        {
          icon: Compass,
          title: "Solutions innovantes rapides",
          desc: "Recevez des idées et prototypes concrets développés par des équipes motivées.",
        },
        {
          icon: DollarSign,
          title: "Renforcez votre marque employeur",
          desc: "Valorisez votre entreprise auprès d’une communauté de jeunes talents.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-orange-500/20 rounded-full">
              <item.icon className="w-10 h-10 text-orange-300" />
            </div>

            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="mt-14">
      <Link
        href="auth/register-company"
        className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-full text-white bg-black/80 hover:bg-black transition-all shadow-xl transform hover:scale-105 w-full sm:w-auto"
      >
        Rejoindre comme Entreprise
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </div>
  </div>
</section>


        {/* ===================== COMMENT ÇA MARCHE ===================== */}
        <section id="how-it-works" className="py-20 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-16">
              Comment ça marche ?
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <HowItWorksStep
                step="1"
                title="Proposez ou Rejoignez"
                description="Les entreprises soumettent un challenge, les talents s'inscrivent individuellement ou en équipe."
              />
              <HowItWorksStep
                step="2"
                title="Innovez & Créez"
                description="Les participants développent des solutions créatives pendant la durée du challenge."
              />
              <HowItWorksStep
                step="3"
                title="Évaluation & Récompense"
                description="Un jury évalue les solutions, et les gagnants reçoivent des prix et des opportunités."
              />
            </div>
          </div>
        </section>

        {/* ===================== CONTACT ===================== */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-orange-700 mb-4">
              Nous Joindre
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Une question ? Notre équipe est là pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg shadow-inner">
                <Phone className="h-6 w-6 text-orange-700" />
                <span className="text-lg font-medium text-gray-900">
                  Téléphone : {CONTACT_PHONE}
                </span>
              </div>
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition shadow-md"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Rejoindre la Communauté WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// --- Composants locaux ---

const AdvantageCard = ({
  icon: Icon,
  title,
  description,
  color = "text-orange-700",
  bgColor = "bg-white",
}: AdvantageCardProps) => (
  <div
    className={`${bgColor} p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}
  >
    <Icon className={`h-10 w-10 ${color} mb-4`} />
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorksStep = ({ step, title, description }: HowItWorksStepProps) => (
  <div className="relative p-6">
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 bg-orange-700 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
      {step}
    </div>
    <div className="pt-8 space-y-3">
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);
