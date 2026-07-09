"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./brutalist.module.css";

export default function BrutalistDesignPage() {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatHeader}>
          <button type="button" className={styles.back} onClick={() => setActive(null)}>
            [ESC]
          </button>
          <h2 className={styles.title}>{active.senderName}</h2>
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div
              key={m.mid}
              className={m.direction === "outgoing" ? styles.out : styles.in}
            >
              {m.message.toUpperCase()}
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder="TYPE LOUDLY" />
          <button type="button">FIRE</button>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/home" className={styles.back}>
          [BACK]
        </Link>
        <h1 className={styles.title}>ALERTS!!!</h1>
      </header>
      <p className={styles.warning}>⚠ DESIGN IS INTENTIONALLY HOSTILE ⚠</p>
      <div className={styles.list}>
        {mockConversations.map((c) => (
          <div key={c.id} className={styles.row}>
            <button
              type="button"
              className={styles.open}
              onClick={() => setActive(c)}
            >
              <div className={styles.name}>{c.senderName}</div>
              <div className={styles.preview}>{c.preview}</div>
              <div>{formatTime(c.lastMessageAt)}</div>
            </button>
            <button type="button" className={styles.del}>
              DEL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
