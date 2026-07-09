"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./timeline.module.css";

type Props = { title: string; subtitle: string };

export function TimelineLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" onClick={() => setActive(null)}>← Inbox</button>
          <div className={styles.subject}>{active.preview}</div>
          <div className={styles.meta}>From: {active.senderName}</div>
        </header>
        <div className={styles.timeline}>
          {active.messages.map((m) => (
            <article key={m.mid} className={styles.event}>
              <div className={styles.dot} />
              <div className={styles.eventBody}>
                <header>
                  <strong>{m.direction === "outgoing" ? "You" : m.senderName}</strong>
                  <time>{formatTime(m.receivedAt)}</time>
                </header>
                <p>{m.message}</p>
              </div>
            </article>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder="Reply to thread…" />
          <button type="button">Reply</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.inboxHeader}>
        <Link href="/home" className={styles.homeLink}>Home</Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      <div className={styles.emailList}>
        {mockConversations.map((conv) => (
          <button key={conv.id} type="button" className={styles.emailRow} onClick={() => setActive(conv)}>
            <div className={styles.emailTop}>
              <strong className={styles.emailFrom}>{conv.senderName}</strong>
              <time>{formatTime(conv.lastMessageAt)}</time>
            </div>
            <div className={styles.emailSubject}>{conv.preview}</div>
            <div className={styles.emailSnippet}>{conv.messages.length} message(s) in thread</div>
          </button>
        ))}
      </div>
    </main>
  );
}
