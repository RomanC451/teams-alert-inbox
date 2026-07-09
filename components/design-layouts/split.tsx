"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./split.module.css";

type Props = { title: string; subtitle: string };

export function SplitLayout({ title, subtitle }: Props) {
  const [activeId, setActiveId] = useState(mockConversations[0]?.id ?? "");
  const active = mockConversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <Link href="/home" className={styles.homeLink}>Home</Link>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      <div className={styles.split}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>Threads</div>
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`${styles.thread} ${conv.id === activeId ? styles.threadActive : ""}`}
              onClick={() => setActiveId(conv.id)}
            >
              <div className={styles.avatar}>{initials(conv.senderName)}</div>
              <div className={styles.threadBody}>
                <span className={styles.threadName}>{conv.senderName.split(",")[0]}</span>
                <span className={styles.threadPreview}>{conv.preview}</span>
              </div>
            </button>
          ))}
        </aside>
        <section className={styles.panel}>
          {active ? (
            <>
              <header className={styles.panelHeader}>
                <div>
                  <div className={styles.panelName}>{active.senderName}</div>
                  <div className={styles.panelEmail}>{active.senderEmail}</div>
                </div>
                <button type="button" className={styles.delBtn}>Del</button>
              </header>
              <div className={styles.messages}>
                {active.messages.map((m) => (
                  <div key={m.mid} className={m.direction === "outgoing" ? styles.rowOut : styles.rowIn}>
                    <div className={m.direction === "outgoing" ? styles.bubbleOut : styles.bubbleIn}>
                      <p>{m.message}</p>
                      <time>{formatTime(m.receivedAt)}</time>
                    </div>
                  </div>
                ))}
              </div>
              <footer className={styles.composer}>
                <input placeholder={`Reply to ${active.senderName.split(",")[0]}…`} />
                <button type="button" className={styles.sendBtn}>Send</button>
              </footer>
            </>
          ) : (
            <p className={styles.empty}>Select a thread</p>
          )}
        </section>
      </div>
    </div>
  );
}
