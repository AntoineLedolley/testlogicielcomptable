"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quel compte utiliser pour une facture de plomberie ?",
  "Comment comptabiliser un dépôt de garantie ?",
  "Quels loyers n'ont pas été encaissés ce mois ?",
  "Explique-moi la TVA sur les loyers commerciaux",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis CogirIA, votre assistant comptable. Je connais votre portefeuille immobilier en temps réel. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/assistant/chat", {
        messages: [...messages, userMsg],
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue. Vérifiez votre connexion." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-xl border bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              msg.role === "assistant" ? "bg-blue-600" : "bg-gray-200"
            )}>
              {msg.role === "assistant"
                ? <Bot className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-gray-600" />
              }
            </div>
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "assistant"
                ? "bg-gray-100 text-gray-900"
                : "bg-blue-600 text-white"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center rounded-2xl bg-gray-100 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="border-t px-6 py-3">
          <p className="mb-2 text-xs font-medium text-gray-400">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-blue-300"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Posez votre question comptable..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
