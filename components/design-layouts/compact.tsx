"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./compact.module.css";

type Props = { title: string; subtitle: string };

export function CompactLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" onClick={() => setActive(null)}>← {active.senderName}</button>
        </header>
        <div className={styles.log}>
          {active.messages.map((m) => (
            <div key={m.mid} className={m.direction === "outgoing" ? styles.lineOut : styles.lineIn}>
              <span className={styles.lineMeta}>{formatTime(m.receivedAt)}</span>
              <span className={styles.lineText}>{m.message}</span>
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder="Reply…" />
          <button type="button">↑</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <div className={styles.headerRow}>
        <div>
          <Link href="/home" className={styles.homeLink}>Home</Link>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <span className={styles.count}>{mockConversations.length}</span>
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.tableHead}>
        <span>From</span>
        <span>Message</span>
        <span>Time</span>
        <span />
      </div>
      {mockConversations.map((conv) => (
        <div key={conv.id} className={styles.tableRow}>
          <button type="button" className={styles.rowBtn} onClick={() => setActive(conv)}>
            <span className={styles.from}>{conv.senderName.split(",")[0]}</span>
            <span className={styles.msg}>{conv.preview}</span>
            <span className={styles.time}>{formatTime(conv.lastMessageAt)}</span>
          </button>
          <button type="button" className={styles.del}>×</button>
        </div>
      ))}
    </main>
  );
}
