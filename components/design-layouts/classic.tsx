"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./classic.module.css";

type Props = { title: string; subtitle: string };

export function ClassicLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" className={styles.backBtn} onClick={() => setActive(null)}>←</button>
          <div className={styles.avatar}>{initials(active.senderName)}</div>
          <div className={styles.headerText}>
            <div className={styles.headerName}>{active.senderName}</div>
            <div className={styles.headerSub}>{active.senderEmail}</div>
          </div>
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div key={m.mid} className={m.direction === "outgoing" ? styles.rowOut : styles.rowIn}>
              <div className={m.direction === "outgoing" ? styles.bubbleOut : styles.bubbleIn}>
                {m.direction === "incoming" && <span className={styles.sender}>{m.senderName}</span>}
                <p>{m.message}</p>
                <time>{formatTime(m.receivedAt)}</time>
              </div>
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
      <header className={styles.toolbar}>
        <div>
          <Link href="/home" className={styles.homeLink}>Home</Link>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <button type="button" className={styles.refreshBtn}>Refresh</button>
      </header>
      <div className={styles.list}>
        {mockConversations.map((conv) => (
          <div key={conv.id} className={styles.row}>
            <button type="button" className={styles.rowMain} onClick={() => setActive(conv)}>
              <div className={styles.avatar}>{initials(conv.senderName)}</div>
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.name}>{conv.senderName}</span>
                  <time>{formatTime(conv.lastMessageAt)}</time>
                </div>
                <div className={styles.preview}>{conv.preview}</div>
              </div>
            </button>
            <button type="button" className={styles.delBtn}>Del</button>
          </div>
        ))}
      </div>
    </main>
  );
}
