"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import styles from "./chatbot-widget.module.css";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type ChatbotWidgetProps = {
  mode?: "preview" | "live";
};

const welcomeMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  text: "Welcome to VISAMGI. I can help you explore the collection and answer store questions.",
};

function previewReply(message: string) {
  const query = message.toLowerCase();
  if (/\b(hello|hi|hey|vanakkam)\b/.test(query)) {
    return "Hello. Tell me what kind of VISAMGI piece you are looking for.";
  }
  if (/\b(ship|shipping|delivery|deliver)\b/.test(query)) {
    return "Preview response: shipping and delivery details would be checked from the current VISAMGI store settings.";
  }
  if (/\b(pay|payment|cash|cod)\b/.test(query)) {
    return "Preview response: payment information would be answered from the approved VISAMGI store policy.";
  }
  if (/\b(return|refund|exchange)\b/.test(query)) {
    return "Preview response: I would show only verified VISAMGI return information when it is available.";
  }
  return "Preview response: the connected rule-based catalogue assistant would search VISAMGI products using your request. This preview is not connected to the live catalogue yet.";
}

export function ChatbotWidget({ mode = "preview" }: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: trimmed }]);
    setMessage("");
    setLoading(true);

    if (mode === "preview") {
      window.setTimeout(() => {
        setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: previewReply(trimmed) }]);
        setLoading(false);
      }, 650);
      return;
    }

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const payload = await response.json() as { message?: unknown };
      const reply = typeof payload.message === "string"
        ? payload.message
        : "The VISAMGI assistant could not prepare a response.";
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: reply }]);
    } catch {
      setMessages((current) => [...current, {
        id: nextId.current++,
        role: "assistant",
        text: "The VISAMGI assistant is temporarily unavailable. Please try again shortly.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") sendMessage(event);
  };

  return (
    <div className={styles.widget}>
      {open && (
        <section id="visamgi-chatbot-panel" className={styles.panel} aria-label="VISAMGI chatbot preview" role="dialog" aria-modal="false">
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>VISAMGI</p>
              <h2>Collection guide</h2>
              <span className={styles.previewBadge}>{mode === "preview" ? "Preview mode · local replies" : "Live mode · rule-based assistant"}</span>
            </div>
            <button className={styles.iconButton} type="button" onClick={() => setOpen(false)} aria-label="Close VISAMGI chatbot">
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className={styles.messages} aria-live="polite" aria-label="Chat messages">
            {messages.map((item) => (
              <div className={item.role === "user" ? styles.userRow : styles.assistantRow} key={item.id}>
                <p className={item.role === "user" ? styles.userMessage : styles.assistantMessage}>{item.text}</p>
              </div>
            ))}
            {loading && (
              <div className={styles.assistantRow} aria-label="VISAMGI is typing">
                <div className={styles.typing} aria-hidden="true"><i /><i /><i /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <label className={styles.srOnly} htmlFor="visamgi-chat-message">Message VISAMGI</label>
            <input
              ref={inputRef}
              id="visamgi-chat-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the collection…"
              autoComplete="off"
              disabled={loading}
            />
            <button className={styles.sendButton} type="submit" disabled={!message.trim() || loading} aria-label="Send message">
              <span aria-hidden="true">↑</span>
            </button>
          </form>
          <p className={styles.disclaimer}>{mode === "preview" ? "Local preview only. Live catalogue responses are not connected." : "Responses use VISAMGI rules and the public catalogue."}</p>
        </section>
      )}

      <button
        className={styles.floatingButton}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="visamgi-chatbot-panel"
        aria-label={open ? "Close VISAMGI chatbot" : "Open VISAMGI chatbot"}
      >
        <span className={styles.floatingText}>{open ? "Close" : "Ask VISAMGI"}</span>
      </button>
    </div>
  );
}
