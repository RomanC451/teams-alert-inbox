"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./terminal.module.css";

export default function TerminalDesignPage() {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.shell}>
        <div className={styles.crt}>
          <div className={styles.chat}>
            <div className={styles.header}>
              <button
                type="button"
                className={styles.back}
                onClick={() => setActive(null)}
              >
                cd ..
              </button>
              <h2 className={styles.title}>
                session --cid={active.cid.slice(0, 12)}...
              </h2>
            </div>
            <div className={styles.log}>
              {active.messages.map((m) => (
                <div
                  key={m.mid}
                  className={
                    m.direction === "outgoing" ? styles.lineOut : styles.lineIn
                  }
                >
                  {m.message}
                </div>
              ))}
            </div>
            <footer className={styles.composer}>
              <span className={styles.prompt}>reply$ </span>
              <input placeholder="echo message..." />
              <span className={styles.cursor}>█</span>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.crt}>
        <div className={styles.header}>
          <Link href="/home" className={styles.back}>
            ./design --exit
          </Link>
          <h1 className={styles.title}>teams-alert-inbox v0.0.1</h1>
          <p className={styles.dim}>
            {mockConversations.length} thread(s) loaded. Type to select:
          </p>
        </div>
        <div className={styles.list}>
          {mockConversations.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={styles.row}
              onClick={() => setActive(c)}
            >
              [{i}] {c.senderName} — {c.preview} ({formatTime(c.lastMessageAt)})
            </button>
          ))}
        </div>
        <p className={styles.dim}>
          <span className={styles.cursor}>█</span> awaiting input...
        </p>
      </div>
    </div>
  );
}
