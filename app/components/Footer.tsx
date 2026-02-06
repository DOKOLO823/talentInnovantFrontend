import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/KZDescNoqkgKqREqCKg34Q?mode=ems_copy_t";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-gray-700 pb-8">
          
          {/* Logo/Titre */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <h3 className="text-3xl font-bold text-orange-700">
              TALENT INNOVANT
            </h3>
            <p className="text-gray-400 text-sm">
              Connecter les talents et les entreprises par l'innovation.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Plateforme</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#challenges" className="hover:text-orange-500 transition">Challenges</Link></li>
              <li><Link href="#avantages-talent" className="hover:text-orange-500 transition">Devenir Talent</Link></li>
              <li><Link href="#avantages-entreprise" className="hover:text-orange-500 transition">Pour Entreprises</Link></li>
              <li><Link href="#how-it-works" className="hover:text-orange-500 transition">Comment ça marche ?</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {/* <li><Link href="/faq" className="hover:text-orange-500 transition">FAQ</Link></li> */}
              <li><Link href="#contact" className="hover:text-orange-500 transition">Contact</Link></li>
              {/* <li><Link href="/terms" className="hover:text-orange-500 transition">Termes & Conditions</Link></li> */}
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Communauté</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition">WhatsApp</a></li>
              {/* <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition">LinkedIn</a></li> */}
            </ul>
          </div>
        </div>

        {/* Droits d'auteur */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {currentYear} Talent Innovant. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}