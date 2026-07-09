"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./blob.module.css";

export default function BlobDesignPage() {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.shell}>
        <div className={styles.aurora} />
        <div className={styles.chat}>
          <header className={styles.chatHeader}>
            <button type="button" className={styles.back} onClick={() => setActive(null)}>
              ← ooze back
            </button>
            <h2 className={styles.title}>{active.senderName}</h2>
          </header>
          <div className={styles.messages}>
            {active.messages.map((m) => (
              <div
                key={m.mid}
                className={
                  m.direction === "outgoing" ? styles.blobOut : styles.blobIn
                }
              >
                {m.message}
              </div>
            ))}
          </div>
          <footer className={styles.composer}>
            <input placeholder="squish a reply..." />
            <button type="button">↑</button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.aurora} />
      <div className={styles.content}>
        <Link href="/home" className={styles.back}>
          ← design lab
        </Link>
        <h1 className={styles.title}>Bioluminescent Inbox</h1>
        <p className={styles.sub}>Alerts that glow in the deep</p>
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
