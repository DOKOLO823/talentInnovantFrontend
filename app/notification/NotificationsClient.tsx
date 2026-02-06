"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { X, CheckCircle, Loader2, Bell } from "lucide-react";
import BackButton from "../components/BackButton";
import { apiFetch } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";

interface Notification {
  id: number;
  details: string;
  date: string;
  lien: string;
}

const getGroupTitle = (dateString: string): string => {
  const date = new Date(dateString.includes('Z') || dateString.includes('+') ? dateString : `${dateString.replace(' ', 'T')}Z`);
  const now = new Date();
  
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0 && date.getDate() === now.getDate()) return "Aujourd'hui";
  if (diffInDays <= 1 && date.getDate() !== now.getDate()) return "Hier";
  if (diffInDays < 7) return "Cette semaine";
  
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString.includes('Z') || dateString.includes('+') ? dateString : `${dateString.replace(' ', 'T')}Z`);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

function NotificationCard({ notification, onDelete }: { notification: Notification, onDelete: (id: number) => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
  };

  return (
    <div className="group relative transition-all duration-300 bg-white hover:bg-gray-50 border-b border-gray-300 last:border-b-0 overflow-hidden">
      {/* Trait orange à gauche comme dans la version initiale */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-700"></div>
      
      <Link 
        href={notification.lien || "#"}
        className="flex items-start pb-4 pt-1 md:py-5 ml-3 md:ml-4 px-1"
      >
        <div className="flex flex-col items-start w-full pr-1">
        
          <div className="flex flex-row justify-between w-full mb-1">
            <span></span>
            <button 
              onClick={handleAction} 
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:cursor-not-allowed"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin text-orange-700" /> : <X size={18} />}
            </button>
          </div>

          <div>
            <p className="text-base font-semibold text-gray-900 text-[15px] leading-snug">
              {notification.details}
            </p>
            <p className="text-xs mt-1 text-gray-500 font-medium">
              {formatTime(notification.date)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiFetch("/notifications", { method: "GET" });
        if (res?.statut === 200) {
          setNotifications(res.notifications);
        }
        await apiFetch("/notifications/nonlues/reset", { method: "GET" });
      } catch (error) {
        console.error("Erreur notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const groupedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const groups: { [key: string]: Notification[] } = {};
    
    sorted.forEach(n => {
      const title = getGroupTitle(n.date);
      if (!groups[title]) groups[title] = [];
      groups[title].push(n);
    });
    
    return groups;
  }, [notifications]);

  const handleDelete = async (idToDelete: number) => {
    try {
      const res = await apiFetch(`/notification/delete/${idToDelete}`, { method: "GET" });
      if (res?.statut === 200) {
        setNotifications(prev => prev.filter(n => n.id !== idToDelete));
        toast.success(res?.message || "Notification supprimée");
      } else {
        toast.error(res?.message || "Impossible de supprimer");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  return (
   <div className="min-h-screen bg-gray-100 pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Toaster position="top-center" />
        <BackButton m={4} />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex py-32 justify-center bg-white rounded-xl shadow-sm border">
            <Loader2 className="animate-spin text-orange-700" size={32} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedNotifications).map(([title, items]) => (
              <div key={title} className="relative">
                {/* TITRE DE GROUPE STICKY (Effet WhatsApp) */}
                <h2 className="sticky top-0 z-20 py-2 bg-gray-100 text-[15px] font-bold text-gray-500 first-letter:uppercase tracking-[0.2em] ml-1">
                  {title}
                </h2>
                
                <div className="mt-2 rounded-xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100 bg-white">
                  {items.map(n => (
                    <NotificationCard key={n.id} notification={n} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <p className="text-xl font-medium text-gray-900">Votre boîte est vide !</p>
            <p className="text-sm text-gray-500 mt-1">Aucune notification à afficher pour l'instant.</p>
          </div>
        )}
      </div>
    </div>
  );
}