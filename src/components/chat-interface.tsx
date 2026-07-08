"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sprout, Loader2 } from "lucide-react";
import { getProfile, getChatHistory, saveChatHistory, clearChatHistory } from "@/lib/storage";
import { generateId, formatTime } from "@/lib/utils";
import type { ChatMessage, FarmerProfile } from "@/lib/types";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    const history = getChatHistory();
    if (history.length === 0) {
      const welcome: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          p.language === "sw"
            ? `Habari${p.name ? ` ${p.name}` : ""}! Mimi ni Mshauri wa Mkulima AI. Ninaweza kukusaidia na mazao, mbolea, wadudu, na masoko. Una swali gani leo?`
            : `Hello${p.name ? ` ${p.name}` : ""}! I'm your Mkulima AI advisor. Ask me about crops, fertilizer, pests, weather, or markets.`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    } else {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const p = profile ?? getProfile();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: p,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const final = [...updated, assistantMsg];
      setMessages(final);
      saveChatHistory(final);
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          profile?.language === "sw"
            ? "Samahani, kuna tatizo. Jaribu tena baadaye."
            : "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...updated, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    clearChatHistory();
    const p = getProfile();
    const welcome: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content:
        p.language === "sw"
          ? "Mazungumzo yamefutwa. Una swali gani?"
          : "Chat cleared. What would you like to know?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col">
      <div className="flex items-center justify-between border-b border-card-border bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-forest p-2">
            <Sprout className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-forest">Mkulima AI</h1>
            <p className="text-xs text-muted">
              {profile?.language === "sw" ? "Mshauri wa kilimo" : "Farming advisor"}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-cream-dark hover:text-soil"
          aria-label="Clear chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "rounded-br-md bg-forest text-white"
                  : "rounded-bl-md border border-card-border bg-white text-soil shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              <p
                className={`mt-1 text-[10px] ${
                  msg.role === "user" ? "text-white/60" : "text-muted"
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-card-border bg-white px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-forest" />
              <span className="text-sm text-muted animate-pulse-soft">
                {profile?.language === "sw" ? "Inafikiria..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-card-border bg-white px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              profile?.language === "sw"
                ? "Uliza swali lako..."
                : "Ask your farming question..."
            }
            className="flex-1 rounded-xl border border-card-border bg-cream px-4 py-2.5 text-sm text-soil placeholder:text-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-xl bg-terracotta p-2.5 text-white transition-all hover:bg-terracotta-dark disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
