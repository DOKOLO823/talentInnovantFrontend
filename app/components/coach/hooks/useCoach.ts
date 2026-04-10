// hooks/useCoach.ts
import { useState, useCallback } from "react";
import { apiFetch } from "@/app/lib/api";

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachConversation {
  id: number;
  titre: string;
  mode: "general" | "challenge";
  challenge_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuotaInfo {
  utilise: number;
  limite: number;
  restant: number;
}

export function useCoach(mode: "general" | "challenge", challengeId?: number) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<CoachConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState<string>("");

  const fetchQuota = useCallback(async () => {
    try {
      const res = await apiFetch("/coach/quota", { method: "GET" });
      if (res?.statut === 200) {
        setQuota(res);
        setQuotaExceeded(res.restant <= 0);
      }
    } catch (e) {
      console.error("Erreur chargement quota:", e);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const params =
        mode === "challenge" && challengeId
          ? `?mode=challenge&challenge_id=${challengeId}`
          : `?mode=general`;
      const res = await apiFetch(`/coach/conversations${params}`, {
        method: "GET",
      });
      if (res?.statut === 200) {
        setConversations(res.conversations || []);
      }
    } catch (e) {
      console.error("Erreur chargement conversations:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [mode, challengeId]);

  const loadConversation = useCallback(async (convId: number) => {
    setLoadingHistory(true);
    try {
      const res = await apiFetch(`/coach/conversations/${convId}`, {
        method: "GET",
      });
      if (res?.statut === 200) {
        setConversationId(convId);
        setMessages(
          res.messages.map((m: any) => ({ role: m.role, content: m.content }))
        );
      }
    } catch (e) {
      console.error("Erreur chargement conversation:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  const deleteConversation = useCallback(
    async (convId: number) => {
      await apiFetch(`/coach/conversations/${convId}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (conversationId === convId) {
        newConversation();
      }
    },
    [conversationId, newConversation]
  );

  // Modification ici : Ajout du paramètre optionnel intent
  const sendMessage = useCallback(
    async (content: string, intent?: string) => {
      if (!content.trim() || loading) return;

      const userMsg: CoachMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const endpoint =
          mode === "challenge"
            ? `/coach/chat/challenge/${challengeId}`
            : `/coach/chat/general`;

        // Construction du body avec l'intent s'il existe
        const body: any = { 
          message: content,
          ...(intent && { intent }), // Ajoute l'intent si défini
          ...(conversationId && { conversation_id: conversationId })
        };

        const res = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        }); 
        console.log(res)

        if (res?.statut === 429 && res?.quota) {
          setQuotaExceeded(true);
          setQuotaMessage(res.message);
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        if (res?.statut === 200) {
          const assistantMsg: CoachMessage = {
            role: "assistant",
            content: res.response,
          };
          setMessages((prev) => [...prev, assistantMsg]);

          if (!conversationId && res.conversation_id) {
            setConversationId(res.conversation_id);
          }

          if (res.quota) {
            setQuota(res.quota);
            setQuotaExceeded(res.quota.restant <= 0);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "❌ Une erreur est survenue. Veuillez réessayer.",
            },
          ]);
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Erreur de connexion. Veuillez réessayer.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, mode, challengeId, conversationId]
  );

  return {
    messages,
    conversationId,
    conversations,
    loading,
    loadingHistory,
    quota,
    quotaExceeded,
    quotaMessage,
    sendMessage,
    fetchConversations,
    fetchQuota,
    loadConversation,
    newConversation,
    deleteConversation,
  };
}