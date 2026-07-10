"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoginForm } from "@/components/login-form";
import { chatPath } from "@/lib/chat-routes";
import {
  collectNotifications,
  formatMessageTime,
  groupAlertsByCid,
  initials,
} from "@/lib/group-conversations";
import type { Conversation } from "@/lib/group-conversations";
import { useInbox } from "@/lib/use-inbox";

export default function HomePage() {
  const {
    alerts,
    loading,
    error,
    setError,
    toast,
    setToast,
    needsAuth,
    password,
    setPassword,
    handleLogin,
    loadAlerts,
  } = useInbox();

  const [deletingCid, setDeletingCid] = useState<string | null>(null);

  const conversations = useMemo(() => groupAlertsByCid(alerts), [alerts]);
  const notifications = useMemo(() => collectNotifications(alerts), [alerts]);

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

      setToast("Chat deleted");
      await loadAlerts();
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete chat");
    } finally {
      setDeletingCid(null);
    }
  }

  function handleDeleteFromList(conv: Conversation) {
    deleteConversation(conv.cid, conv.displayName);
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
      {!loading &&
        conversations.length === 0 &&
        notifications.length === 0 && (
          <p className="empty">No alerts in [TEAMS-ALERT]</p>
        )}

      {!loading && notifications.length > 0 && (
        <section className="notifications-section">
          <h2 className="section-title">Notifications</h2>
          <div className="notification-list">
            {notifications.map((notification) => {
              const linkedChat = conversations.find(
                (conv) => conv.cid === notification.cid
              );
              const label = notification.senderName;
              const subtitle = notification.chat || "Ping with no message";

              if (!linkedChat) {
                return (
                  <div key={notification.mid} className="notification-row">
                    <div className="notification-main notification-main-static">
                      <div className="avatar notification-avatar">
                        {initials(label)}
                      </div>
                      <div className="notification-body">
                        <div className="notification-top">
                          <span className="notification-name">{label}</span>
                          <time>{formatMessageTime(notification.receivedAt)}</time>
                        </div>
                        <div className="notification-sub">{subtitle}</div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={notification.mid} className="notification-row">
                  <Link
                    href={chatPath(linkedChat.id)}
                    className="notification-main"
                    onClick={() => setError(null)}
                  >
                    <div className="avatar notification-avatar">
                      {initials(label)}
                    </div>
                    <div className="notification-body">
                      <div className="notification-top">
                        <span className="notification-name">{label}</span>
                        <time>{formatMessageTime(notification.receivedAt)}</time>
                      </div>
                      <div className="notification-sub">{subtitle}</div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && conversations.length > 0 && (
        <section className="conversations-section">
          <h2 className="section-title">Chats</h2>
          <div className="conversation-list">
            {conversations.map((conv) => (
              <div key={conv.id} className="conversation-row">
                <Link
                  href={chatPath(conv.id)}
                  className="conversation-main"
                  onClick={() => setError(null)}
                >
                  <div className="avatar">{initials(conv.displayName)}</div>
                  <div className="conversation-body">
                    <div className="conversation-top">
                      <span className="conversation-name">{conv.displayName}</span>
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
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-danger-icon btn-danger-compact conversation-delete"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteFromList(conv);
                  }}
                  disabled={deletingCid === conv.cid || loading}
                  aria-label={`Delete chat with ${conv.displayName}`}
                  title="Delete chat"
                >
                  {deletingCid === conv.cid ? "…" : "Del"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
