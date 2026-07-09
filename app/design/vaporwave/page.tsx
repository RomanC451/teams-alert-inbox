"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./vaporwave.module.css";

export default function VaporwaveDesignPage() {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <div className={styles.grid} />
        <header className={styles.chatHeader}>
          <button
            type="button"
            className={styles.back}
            onClick={() => setActive(null)}
          >
            ◄ RETRO
          </button>
          <h2 className={styles.title}>{active.senderName}</h2>
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div
              key={m.mid}
              className={
                m.direction === "outgoing" ? styles.bubbleOut : styles.bubbleIn
              }
            >
              {m.message}
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder="transmit vibes..." />
          <button type="button" className={styles.send}>
            SEND
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.grid} />
      <header className={styles.header}>
        <Link href="/home" className={styles.back}>
          ◄ LAB
        </Link>
        <h1 className={styles.title}>TEAMS ALERTS</h1>
        <p className={styles.sub}>Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ</p>
      </header>
      <div className={styles.list}>
        {mockConversations.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.card}
            onClick={() => setActive(c)}
          >
            <div className={styles.name}>{c.senderName}</div>
            <div className={styles.preview}>{c.preview}</div>
            <div className={styles.sub}>{formatTime(c.lastMessageAt)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
