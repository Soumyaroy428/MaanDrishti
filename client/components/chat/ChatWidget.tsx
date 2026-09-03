import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api-client";
import { X, Send, Loader2, Sparkles, MessageCircle } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";

const SUGGESTIONS = [
  "How do I register a new instrument?",
  "Where can I see the district compliance map?",
  "How does the verification workflow work?",
  "Where do I find my certificates?",
];

export default function ChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Record<string, unknown> | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = api.agents.subscribeToConversation(
      conversationId,
      (data) => {
        const msgs = data.messages || [];
        setMessages(msgs);
        const last = msgs[msgs.length - 1];
        if (last && last.role === "assistant" && last.content)
          setWaiting(false);
      },
    );
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, waiting, open]);

  const openChat = async () => {
    setOpen(true);
    if (conversationId) return;
    setInitLoading(true);
    try {
      const conv = await api.agents.createConversation({
        agent_name: "navigation_assistant",
        metadata: {
          name: "Navigation Assistant",
          description: "In-app navigation help",
        },
      });
      setConversation(conv);
      setConversationId(conv.id || null);
    } catch (e) {
      setMessages([]);
    }
    setInitLoading(false);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || !conversation || sending) return;
    setInput("");
    setSending(true);
    setWaiting(true);
    const role = localStorage.getItem("mv_role") || "business";
    try {
      await api.agents.addMessage(conversation, {
        role: "user",
        content: `[context: role=${role}, page=${location.pathname}] ${msg}`,
      });
    } catch (e) {
      setWaiting(false);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={openChat}
        aria-label="Open MaanVerify Assistant"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:top-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[380px]">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              MaanVerify Assistant
            </p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Context-aware navigation help
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
          className="rounded-lg p-1.5 hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto bg-background/50 px-3 py-3"
      >
        {initLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Starting assistant…
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Hi! Ask me how to find anything in the app.
            </p>
            <div className="grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <MessageBubble key={m.id || i} message={m} />
            ))}
            {waiting && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex shrink-0 gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the app…"
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || !conversation}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
