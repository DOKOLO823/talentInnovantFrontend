"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  details: string;
  date: string;
  lien: string;
}

const getGroupTitle = (dateString: string): string => {
  const date = new Date(
    dateString.includes("Z") || dateString.includes("+")
      ? dateString
      : `${dateString.replace(" ", "T")}Z`,
  );
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0 && date.getDate() === now.getDate())
    return "Aujourd'hui";
  if (diffInDays <= 1 && date.getDate() !== now.getDate()) return "Hier";
  if (diffInDays < 7) return "Cette semaine";

  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const formatTime = (dateString: string): string => {
  const date = new Date(
    dateString.includes("Z") || dateString.includes("+")
      ? dateString
      : `${dateString.replace(" ", "T")}Z`,
  );
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function NotificationRow({
  notification,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onDelete: (id: number) => Promise<void>;
  onNavigate: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
  };

  return (
    <Link
      href={notification.lien || "#"}
      onClick={onNavigate}
      className="group relative mb-0.5 flex items-start gap-3 pl-4 pr-2 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-700" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {notification.details}
        </p>
        <p className="text-[11px] mt-1 text-gray-400 font-medium">
          {formatTime(notification.date)}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <Loader2 size={15} className="animate-spin text-orange-700" />
        ) : (
          <X size={15} />
        )}
      </button>
    </Link>
  );
}

export default function NotificationsDropdown({
  onClose,
}: {
  onClose: () => void;
}) {
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
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const groups: { [key: string]: Notification[] } = {};
    sorted.forEach((n) => {
      const title = getGroupTitle(n.date);
      if (!groups[title]) groups[title] = [];
      groups[title].push(n);
    });
    return groups;
  }, [notifications]);

  const handleDelete = async (idToDelete: number) => {
    try {
      const res = await apiFetch(`/notification/delete/${idToDelete}`, {
        method: "GET",
      });
      if (res?.statut === 200) {
        setNotifications((prev) => prev.filter((n) => n.id !== idToDelete));
        toast.success(res?.message || "Notification supprimée");
      } else {
        toast.error(res?.message || "Impossible de supprimer");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  return (
    <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-full mt-0 sm:mt-3 mx-auto sm:mx-0 w-auto sm:w-[380px] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white sticky top-0">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="flex py-16 justify-center">
            <Loader2 className="animate-spin text-orange-700" size={26} />
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {Object.entries(groupedNotifications).map(([title, items]) => (
              <div key={title}>
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50">
                  {title}
                </p>
                {items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onDelete={handleDelete}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={22} className="text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900">
              Votre boîte est vide !
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Aucune notification pour l'instant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
