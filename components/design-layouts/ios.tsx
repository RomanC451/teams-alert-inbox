"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./ios.module.css";

type Props = { title: string; subtitle: string };

export function IosLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);

  if (active) {
    return (
      <div className={styles.chat}>
        <header className={styles.chatBar}>
          <button type="button" className={styles.back} onClick={() => setActive(null)}>
            <span className={styles.chevron}>‹</span>
            <span>Back</span>
          </button>
          <div className={styles.chatTitle}>
            <div className={styles.chatAvatar}>{initials(active.senderName)}</div>
            <span>{active.senderName.split(",")[0]}</span>
          </div>
          <div className={styles.spacer} />
        </header>
        <div className={styles.messages}>
          {active.messages.map((m) => (
            <div key={m.mid} className={m.direction === "outgoing" ? styles.out : styles.in}>
              {m.message}
            </div>
          ))}
        </div>
        <footer className={styles.composer}>
          <div className={styles.inputWrap}>
            <input placeholder="iMessage" />
            <button type="button" className={styles.send}>↑</button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.nav}>
        <Link href="/home" className={styles.home}>Home</Link>
        <h1>{title}</h1>
        <button type="button" className={styles.edit}>Edit</button>
      </header>
      <p className={styles.sub}>{subtitle}</p>
      <div className={styles.list}>
        {mockConversations.map((conv) => (
          <button key={conv.id} type="button" className={styles.row} onClick={() => setActive(conv)}>
            <div className={styles.avatar}>{initials(conv.senderName)}</div>
            <div className={styles.content}>
              <div className={styles.top}>
                <span className={styles.name}>{conv.senderName.split(",")[0]}</span>
                <time>{formatTime(conv.lastMessageAt)}</time>
              </div>
              <p className={styles.preview}>{conv.preview}</p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
