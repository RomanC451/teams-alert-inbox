"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { chatPath } from "@/lib/chat-routes";
import {
  formatMessageTime,
  initials,
  type AlertNotification,
  type Conversation,
} from "@/lib/group-conversations";

const SEEN_KEY = "teams-alert-seen-notifications";

function readSeenMids(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

function writeSeenMids(mids: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...mids]));
}

type NotificationsBellProps = {
  notifications: AlertNotification[];
  conversations: Conversation[];
};

export function NotificationsBell({
  notifications,
  conversations,
}: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [seenMids, setSeenMids] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSeenMids(readSeenMids());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const unseenCount = useMemo(() => {
    if (!hydrated) return 0;
    return notifications.filter((n) => !seenMids.has(n.mid)).length;
  }, [hydrated, notifications, seenMids]);

  function openDialog() {
    setOpen(true);
    if (notifications.length === 0) return;

    const next = new Set(seenMids);
    for (const notification of notifications) {
      next.add(notification.mid);
    }
    setSeenMids(next);
    writeSeenMids(next);
  }

  function closeDialog() {
    setOpen(false);
  }

  const hasUnseen = unseenCount > 0;

  return (
    <>
      <button
        type="button"
        className={`toolbar-btn notification-bell${hasUnseen ? " has-unseen" : ""}`}
        onClick={openDialog}
        aria-label={
          hasUnseen
            ? `${unseenCount} new notification${unseenCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        title="Notifications"
      >
        <span className="notification-bell-icon" aria-hidden="true">
          🔔
        </span>
        {hasUnseen && (
          <>
            <span className="notification-bell-ping" aria-hidden="true" />
            <span className="notification-bell-badge">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="notification-dialog-backdrop" onClick={closeDialog}>
          <div
            className="notification-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="notification-dialog-header">
              <h2 id="notification-dialog-title">Notifications</h2>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={closeDialog}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </header>

            {notifications.length === 0 ? (
              <p className="notification-dialog-empty">No notifications yet</p>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => {
                  const linkedChat = conversations.find(
                    (conv) => conv.cid === notification.cid
                  );
                  const label = notification.senderName;
                  const subtitle = notification.chat || "Ping with no message";

                  const body = (
                    <>
                      <div className="avatar notification-avatar">
                        {initials(label)}
                      </div>
                      <div className="notification-body">
                        <div className="notification-top">
                          <span className="notification-name">{label}</span>
                          <time>
                            {formatMessageTime(notification.receivedAt)}
                          </time>
                        </div>
                        <div className="notification-sub">{subtitle}</div>
                      </div>
                    </>
                  );

                  if (!linkedChat) {
                    return (
                      <div key={notification.mid} className="notification-row">
                        <div className="notification-main notification-main-static">
                          {body}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={notification.mid} className="notification-row">
                      <Link
                        href={chatPath(linkedChat.id)}
                        className="notification-main"
                        onClick={closeDialog}
                      >
                        {body}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
