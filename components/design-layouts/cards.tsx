"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./cards.module.css";

type Props = { title: string; subtitle: string };

export function CardsLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <button type="button" className={styles.backFab} onClick={() => setActive(null)}>←</button>
        <header className={styles.chatHero}>
          <div className={styles.heroAvatar}>{initials(active.senderName)}</div>
          <h2>{active.senderName}</h2>
          <p>{active.senderEmail}</p>
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div key={m.mid} className={styles.msgCard}>
              <div className={styles.msgLabel}>{m.direction === "outgoing" ? "You" : m.senderName}</div>
              <p>{m.message}</p>
              <time>{formatTime(m.receivedAt)}</time>
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <textarea placeholder="Write a reply…" rows={2} />
          <button type="button">Send reply</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <Link href="/home" className={styles.homeLink}>Home</Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.grid}>
        {mockConversations.map((conv) => (
          <button key={conv.id} type="button" className={styles.card} onClick={() => setActive(conv)}>
            <div className={styles.cardAvatar}>{initials(conv.senderName)}</div>
            <h3 className={styles.cardName}>{conv.senderName}</h3>
            <blockquote className={styles.cardQuote}>"{conv.preview}"</blockquote>
            <div className={styles.cardFooter}>
              <time>{formatTime(conv.lastMessageAt)}</time>
              <span>{conv.messages.length} msgs</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
