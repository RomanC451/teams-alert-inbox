"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./telegram.module.css";

type Props = { title: string; subtitle: string };

export function TelegramLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHead} style={{ background: "var(--tg-blue)" }}>
          <button type="button" onClick={() => setActive(null)}>←</button>
          <div>
            <div className={styles.chatName}>{active.senderName}</div>
            <div className={styles.chatStatus}>online</div>
          </div>
        </header>
        <div className={styles.wallpaper}>
          {active.messages.map((m) => (
            <div key={m.mid} className={m.direction === "outgoing" ? styles.bOut : styles.bIn}>
              {m.message}
              <time>{formatTime(m.receivedAt)}</time>
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder="Message" />
          <button type="button">➤</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.head}>
        <Link href="/home">Home</Link>
        <h1>{title}</h1>
        <button type="button">✎</button>
      </header>
      <p className={styles.sub}>{subtitle}</p>
      {mockConversations.map((c) => (
        <button key={c.id} type="button" className={styles.row} onClick={() => setActive(c)}>
          <div className={styles.avatar}>{initials(c.senderName)}</div>
          <div className={styles.body}>
            <div className={styles.top}>
              <span>{c.senderName}</span>
              <time>{formatTime(c.lastMessageAt)}</time>
            </div>
            <p>{c.preview}</p>
          </div>
        </button>
      ))}
    </main>
  );
}
