"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./grouped.module.css";

type Props = { title: string; subtitle: string };

export function GroupedLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const today = mockConversations.filter((c) => c.id !== "cid-3");
  const earlier = mockConversations.filter((c) => c.id === "cid-3");
  const shown = tab === "all" ? mockConversations : mockConversations.slice(0, 2);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" className={styles.backBtn} onClick={() => setActive(null)}>←</button>
          <div className={styles.avatar}>{initials(active.senderName)}</div>
          <div className={styles.headerName}>{active.senderName}</div>
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div key={m.mid} className={m.direction === "outgoing" ? styles.rowOut : styles.rowIn}>
              <div className={m.direction === "outgoing" ? styles.bubbleOut : styles.bubbleIn}>{m.message}</div>
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <textarea placeholder="Reply…" rows={1} />
          <button type="button" className={styles.sendBtn}>↑</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <Link href="/home" className={styles.homeLink}>Home</Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.tabs}>
        <button type="button" className={tab === "all" ? styles.tabActive : styles.tab} onClick={() => setTab("all")}>All</button>
        <button type="button" className={tab === "unread" ? styles.tabActive : styles.tab} onClick={() => setTab("unread")}>Unread</button>
      </div>
      <input className={styles.search} placeholder="Search conversations…" />
      {tab === "all" && today.length > 0 && (
        <>
          <h2 className={styles.section}>Today</h2>
          {today.map((conv) => (
            <button key={conv.id} type="button" className={styles.row} onClick={() => setActive(conv)}>
              <div className={styles.avatar}>{initials(conv.senderName)}</div>
              <div className={styles.body}>
                <span className={styles.name}>{conv.senderName}</span>
                <span className={styles.preview}>{conv.preview}</span>
              </div>
              <time>{formatTime(conv.lastMessageAt)}</time>
            </button>
          ))}
        </>
      )}
      {tab === "all" && earlier.length > 0 && (
        <>
          <h2 className={styles.section}>Earlier</h2>
          {earlier.map((conv) => (
            <button key={conv.id} type="button" className={styles.row} onClick={() => setActive(conv)}>
              <div className={styles.avatar}>{initials(conv.senderName)}</div>
              <div className={styles.body}>
                <span className={styles.name}>{conv.senderName}</span>
                <span className={styles.preview}>{conv.preview}</span>
              </div>
              <time>{formatTime(conv.lastMessageAt)}</time>
            </button>
          ))}
        </>
      )}
      {tab === "unread" && shown.map((conv) => (
        <button key={conv.id} type="button" className={styles.rowUnread} onClick={() => setActive(conv)}>
          <div className={styles.unreadDot} />
          <div className={styles.avatar}>{initials(conv.senderName)}</div>
          <div className={styles.body}>
            <span className={styles.name}>{conv.senderName}</span>
            <span className={styles.preview}>{conv.preview}</span>
          </div>
          <time>{formatTime(conv.lastMessageAt)}</time>
        </button>
      ))}
    </main>
  );
}
