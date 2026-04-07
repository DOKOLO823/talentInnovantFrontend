"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Menu,
  Plus,
  Trash2,
  Bot,
  MessageSquare,
  Sparkles,
  User,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  LogIn,
  UserPlus,
  Lock,
  Zap,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useCoach } from "./hooks/useCoach";

export interface PredefinedCard {
  id: string;
  emoji: string;
  title: string;
  description: string;
  hasInput?: boolean;
  inputPlaceholder?: string;
  inputMaxLength?: number;
  buildPrompt: (input?: string) => string;
}

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "general" | "challenge";
  userName?: string;
  challengeId?: number;
  challengeName?: string;
  predefinedCards: PredefinedCard[];
  currentUser?: any; // user connecté ou null
}

// --- MESSAGES D'ACCUEIL ALÉATOIRES ---
const greetings = [
  (name: string) => `Salut ${name} 👋`,
  (name: string) => `Heureux de vous revoir, ${name} 😊`,
  (name: string) => `Bonjour ${name}, prêt à innover ? 🚀`,
  (name: string) => `Content de vous retrouver, ${name} ✨`,
  (name: string) => `Bienvenue, ${name} ! On passe à l'action ? 🎯`,
];

// --- MODAL CONNEXION REQUISE ---
function LoginRequiredModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Connexion requise
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Vous devez être connecté pour utiliser le coach IA et poser vos
          questions.
        </p>
        <div className="space-y-3">
          <a
            href="/auth/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl transition-all"
          >
            <LogIn size={16} /> Se connecter
          </a>
          <a
            href="/auth/register-talent"
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-100 hover:border-orange-200 text-gray-700 font-bold rounded-xl transition-all"
          >
            <UserPlus size={16} /> S'inscrire gratuitement
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// --- MODAL QUOTA ATTEINT ---
function QuotaExceededModal({
  isOpen,
  onClose,
  message,
  limite,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  limite: number;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Limite quotidienne atteinte
        </h3>
        <p className="text-gray-600 text-sm mb-2">{message}</p>
        <p className="text-xs text-gray-400 mb-6">
          Votre compteur se remet à zéro automatiquement chaque jour à minuit.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl transition-all"
        >
          J'ai compris
        </button>
      </motion.div>
    </div>
  );
}

// --- MODAL DE CONFIRMATION DE SUPPRESSION ---
function DeleteConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">
            Supprimer la discussion ?
          </h3>
          <p className="text-sm text-gray-500">
            Cette action est irréversible. Tous les messages de cette discussion
            seront définitivement supprimés.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- BOUTON COPIER ---
const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-600" />
          <span className="text-green-600">Copié !</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Copier</span>
        </>
      )}
    </button>
  );
};

// --- PARSE CONTENU : isole la question de clôture ---
function parseContent(content: string): {
  body: string;
  closingQuestion: string | null;
} {
  const lines = content.trim().split("\n");
  let closingQuestion: string | null = null;
  let bodyLines = [...lines];

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    if (
      line.endsWith("?") ||
      line.startsWith("➡") ||
      line.startsWith("👉") ||
      line.startsWith("---")
    ) {
      closingQuestion = line.replace(/^---\s*/, "").trim();
      bodyLines = lines.slice(0, i);
    }
    break;
  }

  return { body: bodyLines.join("\n").trimEnd(), closingQuestion };
}

// --- COMPOSANTS MARKDOWN PERSONNALISÉS ---
const markdownComponents: any = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-extrabold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-extrabold text-gray-900 mt-8 mb-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-orange-700 rounded-full inline-block shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-bold text-gray-800 mt-6 mb-2 uppercase tracking-wide">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-gray-700 leading-8 text-base mb-5">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="my-4 space-y-2 pl-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-4 space-y-3 pl-1 list-none">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start gap-3 text-gray-700 text-base leading-7">
      <span className="mt-1.5 w-2 h-2 bg-orange-700 rounded-full shrink-0" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-gray-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-gray-600">{children}</em>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-orange-300 pl-5 py-2 my-6 bg-orange-50 rounded-r-xl text-gray-700 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-100" />,
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline underline-offset-2 font-medium hover:text-blue-800 transition-colors cursor-pointer"
    >
      {children}
    </a>
  ),
  code: ({ inline, children }: any) =>
    inline ? (
      <code className="bg-gray-100 text-orange-700 px-1.5 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    ) : (
      <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto my-4 font-mono text-sm">
        <code>{children}</code>
      </pre>
    ),
};

// --- COMPOSANT MESSAGE IA AVEC TYPEWRITER ---
const TypewriterMessage = memo(
  ({ content, isLatest }: { content: string; isLatest: boolean }) => {
    const [displayedText, setDisplayedText] = useState(isLatest ? "" : content);
    const [done, setDone] = useState(!isLatest);
    const indexRef = useRef(isLatest ? 0 : content.length);

    useEffect(() => {
      if (!isLatest) return;
      const speed = 8;
      const run = () => {
        if (indexRef.current < content.length) {
          const chunk = content.slice(indexRef.current, indexRef.current + 3);
          setDisplayedText((prev) => prev + chunk);
          indexRef.current += 3;
          setTimeout(run, speed);
        } else {
          setDone(true);
        }
      };
      const t = setTimeout(run, speed);
      return () => clearTimeout(t);
    }, [content, isLatest]);

    const { body, closingQuestion } = parseContent(displayedText);

    return (
      <div className="w-full">
        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {body}
          </ReactMarkdown>
        </div>
        {closingQuestion && (
          <div className="mt-8 pt-6 border-t border-orange-100">
            <div className="inline-flex items-start gap-3 bg-orange-50 border border-orange-100 px-5 py-4 rounded-2xl">
              <span className="text-orange-600 text-lg mt-0.5">💬</span>
              <p className="text-gray-800 font-semibold text-base leading-relaxed">
                {closingQuestion}
              </p>
            </div>
          </div>
        )}
        {done && (
          <div className="mt-4">
            <CopyButton content={content} />
          </div>
        )}
      </div>
    );
  },
);
TypewriterMessage.displayName = "TypewriterMessage";

// ─────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function CoachModal({
  isOpen,
  onClose,
  mode,
  userName = "Talent",
  challengeId,
  challengeName,
  predefinedCards,
  currentUser,
}: CoachModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [cardInputs, setCardInputs] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | undefined>(
    undefined,
  );

  const [greeting] = useState(() => {
    const fn = greetings[Math.floor(Math.random() * greetings.length)];
    return fn(userName);
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    loading,
    sendMessage,
    fetchConversations,
    fetchQuota,
    loadConversation,
    newConversation,
    deleteConversation,
    conversations,
    loadingHistory,
    conversationId: currentConversationId,
    quota,
    quotaExceeded,
    quotaMessage,
  } = useCoach(mode, challengeId);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      // Charger le quota uniquement si le user est connecté
      if (currentUser) {
        fetchQuota();
      }
    }
  }, [isOpen, fetchConversations, fetchQuota, currentUser]);

  // Surveiller quotaExceeded mis à jour par le hook après une réponse 429
  useEffect(() => {
    if (quotaExceeded && quotaMessage) {
      setShowQuotaModal(true);
    }
  }, [quotaExceeded, quotaMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Garde-fou avant envoi : vérifie connexion et quota
  const guardedSend = useCallback(
    async (overrideMessage?: string, intent?: string) => {
      const msg = (overrideMessage ?? inputValue).trim();
      if (!msg || loading) return;

      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }

      if (quotaExceeded) {
        setShowQuotaModal(true);
        return;
      }

      // On mémorise l'intent utilisé (soit le nouveau, soit celui déjà actif)
      const currentIntent = intent ?? activeIntent;
      if (intent) setActiveIntent(intent);

      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      // On passe l'intent au hook useCoach
      await sendMessage(msg, currentIntent);
    },
    [
      inputValue,
      loading,
      currentUser,
      quotaExceeded,
      sendMessage,
      activeIntent,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      guardedSend();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteConversation(deleteTarget);
      toast.success("Discussion supprimée avec succès.", { duration: 3000 });
    } catch {
      toast.error("Impossible de supprimer cette discussion.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Label du mode affiché dans le badge sous l'avatar
  const modeLabel =
    mode === "general"
      ? "Coach Virtuel • Mode général"
      : "Coach Virtuel • Mode challenge";

  const limite =
    quota?.limite ?? parseInt(process.env.NEXT_PUBLIC_NB_PROMPT_JOUR ?? "5");

  if (!isOpen) return null;

  // Fonction pour relancer la dernière requête utilisateur
  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      // On relance avec le contenu ET l'intent actif
      guardedSend(lastUserMessage.content, activeIntent);
    }
  }, [messages, guardedSend, activeIntent]);

  return (
    <>
      <Toaster position="top-center" />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        message={
          quotaMessage ||
          `Vous avez utilisé vos ${limite} questions d'aujourd'hui. Revenez demain !`
        }
        limite={limite}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-gray-900/70 backdrop-blur-md p-0 md:p-6">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full md:max-w-5xl md:rounded-3xl h-[98dvh] md:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* SIDEBAR HISTORIQUE */}
          <AnimatePresence>
            {showHistory && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowHistory(false)}
                  className="absolute inset-0 bg-black/20 z-40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-y-0 left-0 w-72 md:w-80 bg-white z-50 border-r shadow-2xl flex flex-col"
                >
                  <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                    <span className="font-bold text-gray-900">
                      Vos Discussions
                    </span>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 border-b">
                    <button
                      onClick={() => {
                        newConversation();
                        setShowHistory(false);
                        setActiveIntent(undefined); // Reset de l'intent
                      }}
                      className="w-full py-3 px-4 bg-orange-700 hover:bg-orange-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-md shadow-orange-200"
                    >
                      <Plus size={18} /> Nouvelle discussion
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {loadingHistory ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-orange-700" />
                      </div>
                    ) : conversations.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">
                        Aucune discussion pour le moment.
                      </p>
                    ) : (
                      conversations.map((conv) => {
                        const isActive = conv.id === currentConversationId;
                        return (
                          <div
                            key={conv.id}
                            className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all border-l-4 ${
                              isActive
                                ? "border-l-orange-700 bg-orange-50"
                                : "border-l-transparent hover:bg-gray-50 hover:border-l-gray-200"
                            }`}
                            onClick={() => {
                              loadConversation(conv.id);
                              setShowHistory(false);
                            }}
                          >
                            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                              <MessageSquare
                                size={15}
                                className={
                                  isActive
                                    ? "text-orange-700 shrink-0"
                                    : "text-gray-400 shrink-0"
                                }
                              />
                              <span
                                className={`text-sm truncate ${
                                  isActive
                                    ? "font-bold text-orange-700"
                                    : "font-medium text-gray-700"
                                }`}
                              >
                                {conv.titre || "Discussion sans titre"}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(conv.id);
                              }}
                              className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-all shrink-0 ml-2"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white flex-shrink-0 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
              >
                <Menu size={22} />
              </button>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest hidden md:block">
                Talent Innovant Assistant
              </h2>
            </div>

            {/* Compteur de questions restantes */}
            {currentUser && quota && (
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  quota.restant === 0
                    ? "bg-red-50 border-red-200 text-red-600"
                    : quota.restant <= 2
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                <Zap size={12} />
                {quota.restant}/{quota.limite} questions restantes aujourd'hui
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* CONTENU */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto px-5 md:px-10 py-10">
              {/* ÉCRAN D'ACCUEIL */}
              {messages.length === 0 && (
                <div className="animate-in fade-in duration-700">
                  <div className="mb-12 space-y-8 flex flex-col items-center text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-20 h-20 bg-orange-700 border-4 border-orange-100 rounded-full flex items-center justify-center shrink-0 animate-in zoom-in duration-500">
                        <Bot size={40} className="text-white" />
                      </div>
                      {/* Badge avec mode dynamique */}
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                        {modeLabel}
                      </span>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {greeting}
                      </h1>
                      <p className="text-lg text-start md:text-xl text-gray-600 leading-relaxed">
                        Je suis{" "}
                        <strong className="text-black">
                          TALENT INNOVANT IA
                        </strong>
                        , votre coach personnel pour développer vos projets et
                        maximiser vos performances dans les challenges
                        d'innovation.
                        <br />
                        <span className="block mt-4 font-semibold text-gray-800">
                          Sur quoi travaillez-vous actuellement ? Choisissez un
                          sujet ci-dessous ou posez directement votre question.
                        </span>
                      </p>
                    </div>

                    {/* Compteur mobile (sous le texte d'accueil) */}
                    {currentUser && quota && (
                      <div
                        className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
                          quota.restant === 0
                            ? "bg-red-50 border-red-200 text-red-600"
                            : quota.restant <= 2
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        <Zap size={12} />
                        {quota.restant}/{quota.limite} questions restantes
                        aujourd'hui
                      </div>
                    )}

                    {/* Message si non connecté */}
                    {!currentUser && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-xs font-bold text-orange-700">
                        <Lock size={12} />
                        Connectez-vous pour poser vos questions
                      </div>
                    )}
                  </div>

                  {/* CARDS PRÉDÉFINIES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 max-w-2xl mx-auto">
                    {predefinedCards.map((card: any) => (
                      <div
                        key={card.id}
                        className="bg-white border border-gray-500 rounded-2xl p-7 md:p-8 hover:border-orange-500 transition-all group min-h-[180px] md:min-h-[200px]"
                      >
                        <div className="flex items-center gap-4 mb-5 md:mb-6">
                          <span className="text-3xl md:text-4xl">
                            {card.emoji}
                          </span>
                          <h4 className="font-bold text-gray-900 text-base md:text-xl group-hover:text-orange-700 transition-colors leading-tight">
                            {card.title}
                          </h4>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base mb-6 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-4">
                          {card.description}
                        </p>
                        {card.hasInput && (
                          <textarea
                            className="w-full text-base md:text-lg border border-gray-400 bg-white rounded-xl p-4 mb-5 md:mb-6 focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700 outline-none transition-all resize-vertical min-h-[80px]"
                            rows={3}
                            placeholder={card.inputPlaceholder}
                            value={cardInputs[card.id] || ""}
                            onChange={(e) =>
                              setCardInputs((p) => ({
                                ...p,
                                [card.id]: e.target.value,
                              }))
                            }
                          />
                        )}
                        <button
                          onClick={() =>
                            guardedSend(
                              card.buildPrompt(cardInputs[card.id]),
                              card.id,
                            )
                          }
                          disabled={
                            loading ||
                            (card.hasInput && !cardInputs[card.id]?.trim())
                          }
                          className="w-full py-4 bg-gray-900 hover:bg-orange-700 text-white disabled:bg-gray-100 disabled:text-gray-400 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-gray-100"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              Envoyer la demande <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MESSAGES */}
              <div className="flex flex-col gap-16">
                {messages.map((msg, idx) => {
                  const isErrorMessage =
                    msg.content.includes("Une erreur est survenue") ||
                    msg.content.includes("Une erreur de connexion");

                  const isLastMessage = idx === messages.length - 1;

                  return (
                    <div
                      key={idx}
                      className="w-full animate-in slide-in-from-bottom-4 duration-500"
                    >
                      <div
                        className={`flex items-center gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                            msg.role === "assistant"
                              ? "bg-orange-700 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Bot size={22} />
                          ) : (
                            <User size={22} />
                          )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {msg.role === "assistant" ? "Coach IA" : "Vous"}
                        </span>
                      </div>

                      <div
                        className={`w-full ${msg.role === "user" ? "text-right" : "text-left"}`}
                      >
                        <div
                          className={`inline-block w-full text-left ${
                            msg.role === "user"
                              ? "bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-gray-800 text-lg leading-relaxed shadow-sm"
                              : ""
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="flex flex-col gap-4">
                              <TypewriterMessage
                                content={msg.content}
                                isLatest={isLastMessage}
                              />

                              {/* BOUTON REESSAYER : Apparaît si c'est une erreur */}
                              {isErrorMessage && (
                                <motion.button
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  onClick={handleRetry}
                                  disabled={loading}
                                  className="flex items-center gap-2 w-fit px-4 py-2 mt-2 bg-white border border-orange-200 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                  {loading ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <RefreshCw size={16} />
                                  )}
                                  Relancer la demande
                                </motion.button>
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {loading && (
                <div className="flex items-center gap-3 mt-10 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 w-fit">
                  <Loader2 size={18} className="animate-spin text-orange-700" />
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-widest">
                    Le coach analyse votre demande...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-10" />
            </div>
          </div>

          {/* INPUT ZONE */}
          <div className="bg-white p-4 md:p-8 border-t">
            {/* Compteur visible au-dessus de l'input sur mobile quand messages présents */}
            {currentUser && quota && messages.length > 0 && (
              <div className="max-w-4xl mx-auto mb-2 flex justify-end">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    quota.restant === 0
                      ? "text-red-600 bg-red-50"
                      : quota.restant <= 2
                        ? "text-amber-600 bg-amber-50"
                        : "text-green-700 bg-green-50"
                  }`}
                >
                  <Zap size={10} className="inline mr-1" />
                  {quota.restant}/{quota.limite} questions restantes
                </span>
              </div>
            )}
            <div className="max-w-4xl mx-auto flex items-end gap-3 bg-gray-100 rounded-[2rem] p-3 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-transparent text-lg px-4 py-3 resize-none outline-none text-gray-800 placeholder-gray-400 max-h-48 min-h-[44px]"
                placeholder={
                  !currentUser
                    ? "Connectez-vous pour poser une question..."
                    : quotaExceeded
                      ? "Limite quotidienne atteinte. Revenez demain !"
                      : "Échangez avec votre coach ici..."
                }
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 192) + "px";
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={!currentUser || quotaExceeded}
              />
              <button
                onClick={() => guardedSend()}
                disabled={!inputValue.trim() || loading || quotaExceeded}
                className="p-4 bg-orange-700 text-white rounded-full hover:bg-orange-800 disabled:bg-gray-300 transition-all shadow-lg active:scale-95"
              >
                <Send size={22} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
