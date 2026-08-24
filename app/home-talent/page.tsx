import HomePage from "./HomePage";

// export async function generateStaticParams() {
//   return [];
// }

//  <>
//        <div className="w-full mb-6">
//         {isProfileLoading ? (
//           <CoachBannerSkeleton />
//         ) : profileError ? (
//           /* ÉTAT ERREUR DE CONNEXION */
//           <div className="mx-5 md:mx-28 my-8 p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center text-center gap-4 bg-gray-50/30 animate-in fade-in zoom-in duration-300">
//             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
//               <RefreshCw
//                 size={24}
//                 className="animate-spin"
//                 style={{ animationDuration: "3s" }}
//               />
//             </div>
//             <div className="space-y-1">
//               <h3 className="font-bold text-gray-900 text-lg">
//                 Oups ! Connexion interrompue
//               </h3>
//               <p className="text-gray-500 text-sm max-w-sm">
//                 Nous n'avons pas pu charger votre Coach Virtuel. Vérifiez votre
//                 connexion internet et réessayez.
//               </p>
//             </div>
//             <button
//               onClick={fetchInitialData}
//               className="px-6 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-100 flex items-center gap-2 active:scale-95"
//             >
//               <RefreshCw size={16} />
//               Actualiser
//             </button>
//           </div>
//         ) : (
//           userProfile && (
//             <CoachGeneralBanner
//               userName={userName}
//               userDomain={userProfile?.domaine_principal?.nom}
//               userCompetences={userProfile?.talent?.competences}
//             />
//           )
//         )}
//       </div>
// </>

export default function Page() {
  return <HomePage />;
}
