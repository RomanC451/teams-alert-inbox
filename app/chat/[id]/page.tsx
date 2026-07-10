"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoginForm } from "@/components/login-form";
import {
  formatMessageTime,
  groupAlertsByCid,
  initials,
  latestIncomingMessage,
} from "@/lib/group-conversations";
import { parseChatRouteId } from "@/lib/chat-routes";
import { useInbox } from "@/lib/use-inbox";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const conversationId = parseChatRouteId(params.id);

  const {
    alerts,
    loading,
    refreshing,
    initialized,
    error,
    setError,
    toast,
    setToast,
    needsAuth,
    password,
    setPassword,
    handleLogin,
    refreshInbox,
    upsertAlert,
    removeConversation,
  } = useInbox();

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = useMemo(() => {
    const conversations = groupAlertsByCid(alerts);
    return conversations.find((c) => c.id === conversationId) ?? null;
  }, [alerts, conversationId]);

  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat, activeChat?.messages.length]);

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [reply]);

  function resetComposer() {
    setReply("");
    const el = composerRef.current;
    if (el) el.style.height = "auto";
  }

  async function handleDeleteChat() {
    if (!activeChat?.cid) return;

    const confirmed = window.confirm(
      `Delete chat with ${activeChat.displayName}? This removes all messages from the inbox.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid: activeChat.cid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      setToast("Chat deleted");
      removeConversation(activeChat.cid);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSend() {
    if (!activeChat || !reply.trim()) return;

    const trimmed = reply.trim();
    const lastMessage = activeChat.messages[activeChat.messages.length - 1];
    if (lastMessage && lastMessage.message.trim() === trimmed) {
      resetComposer();
      return;
    }

    const target = latestIncomingMessage(activeChat);
    const replyTo = target?.senderEmail || activeChat.senderEmail;
    if (!replyTo) {
      setError("No email address for this sender");
      return;
    }
    const cid = activeChat.cid || target?.cid;
    if (!cid) {
      setError("No conversation ID for this thread");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: replyTo,
          cid,
          message: trimmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");

      if (data.skipped) {
        resetComposer();
        return;
      }

      setToast(
        `Reply sent to ${latestIncomingMessage(activeChat)?.senderName ?? activeChat.displayName}`
      );
      resetComposer();
      if (data.alert) {
        upsertAlert(data.alert);
      }
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  if (needsAuth) {
    return (
      <LoginForm
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        error={error}
      />
    );
  }

  if (!initialized && loading) {
    return (
      <main className="app-shell">
        <p className="loading">Loading chat…</p>
      </main>
    );
  }

  if (initialized && !activeChat) {
    return (
      <main className="app-shell">
        <p className="empty">Chat not found.</p>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          Back to inbox
        </Link>
      </main>
    );
  }

  if (!activeChat) {
    return null;
  }

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <Link href="/" className="back-btn" aria-label="Back to conversations">
          ←
        </Link>
        <div className="avatar">{initials(activeChat.displayName)}</div>
        <div className="chat-header-text">
          <div className="chat-header-name">{activeChat.displayName}</div>
          <div className="chat-header-sub">
            {activeChat.chatName
              ? activeChat.senderName
              : activeChat.senderEmail || "No email on file"}
          </div>
        </div>
        <button
          className="btn btn-secondary btn-icon btn-danger-icon btn-danger-compact"
          onClick={handleDeleteChat}
          disabled={deleting || refreshing}
          aria-label="Delete chat"
          title="Delete chat"
        >
          {deleting ? "…" : "Del"}
        </button>
        <button
          className="btn btn-secondary btn-icon"
          onClick={refreshInbox}
          disabled={refreshing}
          aria-label="Refresh"
        >
          {refreshing ? "…" : "↻"}
        </button>
      </header>

      <div className="messages">
        {activeChat.messages.map((msg) => (
          <div
            key={msg.mid}
            className={`message-row ${msg.direction === "outgoing" ? "outgoing" : "incoming"}`}
          >
            <div
              className={`bubble ${msg.direction === "outgoing" ? "outgoing" : "incoming"}`}
            >
              {msg.direction === "incoming" && msg.senderName && (
                <span className="bubble-sender">{msg.senderName}</span>
              )}
              <p>{msg.message}</p>
              <time>{formatMessageTime(msg.receivedAt)}</time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="chat-error">{error}</p>}

      <footer className="composer">
        <textarea
          ref={composerRef}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={`Message ${(latestIncomingMessage(activeChat)?.senderName ?? activeChat.senderName).split(",")[0]}… (Ctrl+Enter to send)`}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="btn btn-primary send-btn"
          onClick={handleSend}
          disabled={sending || !reply.trim()}
          aria-label="Send reply"
        >
          {sending ? "…" : "↑"}
        </button>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
