"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./linear.module.css";

type Props = { title: string; subtitle: string };

export function LinearLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.detail}>
        <header className={styles.detailHead}>
          <button type="button" onClick={() => setActive(null)}>← Issues</button>
          <span className={styles.badge}>Open</span>
        </header>
        <h2 className={styles.issueTitle}>{active.preview}</h2>
        <p className={styles.issueMeta}>From {active.senderName}</p>
        <div className={styles.thread}>
          {active.messages.map((m) => (
            <div key={m.mid} className={styles.comment}>
              <div className={styles.commentHead}>
                <span>{m.direction === "outgoing" ? "You" : m.senderName}</span>
                <time>{formatTime(m.receivedAt)}</time>
              </div>
              <p>{m.message}</p>
            </div>
          ))}
        </div>
        <footer className={styles.replyBox}>
          <input placeholder="Leave a comment…" />
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.side}>
        <Link href="/home" className={styles.logo}>◆ Inbox</Link>
        <nav>
          <span className={styles.navOn}>All issues</span>
          <span>Active</span>
          <span>Archive</span>
        </nav>
      </aside>
      <section className={styles.listPane}>
        <header className={styles.listHead}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {mockConversations.map((c) => (
          <button key={c.id} type="button" className={styles.issue} onClick={() => setActive(c)}>
            <span className={styles.issueId}>ALR-{c.id.slice(-1)}</span>
            <div className={styles.issueBody}>
              <strong>{c.preview}</strong>
              <span>{c.senderName} · {formatTime(c.lastMessageAt)}</span>
            </div>
            <span className={styles.dot} />
          </button>
        ))}
      </section>
    </main>
  );
}
