"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  formatMessageTime,
  groupAlertsByCid,
  initials,
  latestIncomingMessage,
} from "@/lib/group-conversations";
import type { Conversation } from "@/lib/group-conversations";
import type { TeamsAlert } from "@/lib/parse-alert";

export default function HomePage() {
  const [alerts, setAlerts] = useState<TeamsAlert[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingCid, setDeletingCid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const conversations = useMemo(() => groupAlertsByCid(alerts), [alerts]);
  const activeChat = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setAlerts(data.alerts);
      setNeedsAuth(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

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
  }, [reply, activeId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    setNeedsAuth(false);
    setError(null);
    loadAlerts();
  }

  async function deleteConversation(cid: string, senderName: string) {
    if (!cid) return;

    const confirmed = window.confirm(
      `Delete chat with ${senderName}? This removes all messages from the inbox.`
    );
    if (!confirmed) return;

    setDeletingCid(cid);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      if (activeId === cid) {
        setActiveId(null);
        setReply("");
      }
      setToast("Chat deleted");
      await loadAlerts();
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete chat");
    } finally {
      setDeletingCid(null);
    }
  }

  function handleDeleteChat() {
    if (!activeChat?.cid) return;
    deleteConversation(activeChat.cid, activeChat.senderName);
  }

  function handleDeleteFromList(conv: Conversation) {
    deleteConversation(conv.cid, conv.senderName);
  }

  function resetComposer() {
    setReply("");
    const el = composerRef.current;
    if (el) el.style.height = "auto";
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

      setToast(`Reply sent to ${activeChat.senderName}`);
      resetComposer();
      await loadAlerts();
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  if (needsAuth) {
    return (
      <main className="app-shell">
        <form className="login" onSubmit={handleLogin}>
          <h1>Teams Alert Inbox</h1>
          <p className="subtitle">Enter app password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="App password"
            autoComplete="current-password"
          />
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
            Unlock
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </main>
    );
  }

  if (activeChat) {
    return (
      <div className="chat-screen">
        <header className="chat-header">
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setActiveId(null);
              setReply("");
              setError(null);
            }}
            aria-label="Back to conversations"
          >
            ←
          </button>
          <div className="avatar">{initials(activeChat.senderName)}</div>
          <div className="chat-header-text">
            <div className="chat-header-name">{activeChat.senderName}</div>
            <div className="chat-header-sub">
              {activeChat.senderEmail || "No email on file"}
            </div>
          </div>
          <button
            className="btn btn-secondary btn-icon btn-danger-icon btn-danger-compact"
            onClick={handleDeleteChat}
            disabled={deletingCid === activeChat.cid || loading}
            aria-label="Delete chat"
            title="Delete chat"
          >
            {deletingCid === activeChat.cid ? "…" : "Del"}
          </button>
          <button
            className="btn btn-secondary btn-icon"
            onClick={loadAlerts}
            disabled={loading}
            aria-label="Refresh"
          >
            ↻
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
            placeholder={`Message ${activeChat.senderName.split(",")[0]}…`}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
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

  return (
    <main className="app-shell">
      <div className="toolbar">
        <div>
          <h1>Teams Alert Inbox</h1>
          <p className="subtitle">One chat per Teams conversation (CID)</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/home" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Home
          </Link>
          <button className="btn btn-secondary" onClick={loadAlerts} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="loading">Loading conversations…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && conversations.length === 0 && (
        <p className="empty">No alerts in [TEAMS-ALERT]</p>
      )}

      <div className="conversation-list">
        {conversations.map((conv) => (
          <div key={conv.id} className="conversation-row">
            <button
              type="button"
              className="conversation-main"
              onClick={() => {
                setActiveId(conv.id);
                setReply("");
                setError(null);
              }}
            >
              <div className="avatar">{initials(conv.senderName)}</div>
              <div className="conversation-body">
                <div className="conversation-top">
                  <span className="conversation-name">{conv.senderName}</span>
                  <time>{formatMessageTime(conv.lastMessageAt)}</time>
                </div>
                <div className="conversation-preview">
                  {conv.preview || "No message text"}
                </div>
                {conv.messages.length > 1 && (
                  <span className="conversation-count">
                    {conv.messages.length} messages
                  </span>
                )}
              </div>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon btn-danger-icon btn-danger-compact conversation-delete"
              onClick={() => handleDeleteFromList(conv)}
              disabled={deletingCid === conv.cid || loading}
              aria-label={`Delete chat with ${conv.senderName}`}
              title="Delete chat"
            >
              {deletingCid === conv.cid ? "…" : "Del"}
            </button>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
