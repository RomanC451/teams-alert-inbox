"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./gmail.module.css";

type Props = { title: string; subtitle: string };

export function GmailLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());

  if (active) {
    return (
      <div className={styles.read}>
        <header className={styles.readHead}>
          <button type="button" onClick={() => setActive(null)}>← Inbox</button>
          <div className={styles.readActions}>
            <button type="button">Archive</button>
            <button type="button">Delete</button>
          </div>
        </header>
        <h1 className={styles.subject}>{active.preview}</h1>
        <div className={styles.fromRow}>
          <div className={styles.fromAvatar}>{initials(active.senderName)}</div>
          <div>
            <strong>{active.senderName}</strong>
            <span>to me</span>
          </div>
          <time>{formatTime(active.lastMessageAt)}</time>
        </div>
        <div className={styles.body}>
          {active.messages.map((m) => (
            <p key={m.mid}>{m.message}</p>
          ))}
        </div>
        <footer className={styles.replyBar}>
          <button type="button">↩ Reply</button>
          <button type="button">↪ Forward</button>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.top}>
        <Link href="/home">Home</Link>
        <input className={styles.search} placeholder="Search mail" />
      </header>
      <div className={styles.layout}>
        <aside className={styles.menu}>
          <button type="button" className={styles.compose}>✎ Compose</button>
          <span className={styles.menuOn}>Inbox</span>
          <span>Sent</span>
          <span>Archive</span>
        </aside>
        <section className={styles.inbox}>
          <div className={styles.inboxHead}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {mockConversations.map((c) => (
            <div key={c.id} className={styles.mailRow}>
              <button
                type="button"
                className={starred.has(c.id) ? styles.starOn : styles.star}
                onClick={() => setStarred((s) => {
                  const n = new Set(s);
                  if (n.has(c.id)) n.delete(c.id); else n.add(c.id);
                  return n;
                })}
              >★</button>
              <button type="button" className={styles.mailMain} onClick={() => setActive(c)}>
                <span className={styles.mailFrom}>{c.senderName.split(",")[0]}</span>
                <span className={styles.mailSubject}>{c.preview}</span>
                <span className={styles.mailSnippet}> — {c.messages.length} messages</span>
              </button>
              <time>{formatTime(c.lastMessageAt)}</time>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
