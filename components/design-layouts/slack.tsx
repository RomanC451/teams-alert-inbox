"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import { initials } from "@/lib/design-themes";
import styles from "./slack.module.css";

type Props = { title: string; subtitle: string };

export function SlackLayout({ title, subtitle }: Props) {
  const [active, setActive] = useState<Conversation | null>(null);
  const [channel, setChannel] = useState(mockConversations[0]?.id ?? "");

  const current = mockConversations.find((c) => c.id === channel) ?? mockConversations[0];

  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <Link href="/home" className={styles.home}>⌂</Link>
        {mockConversations.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.channel} ${channel === c.id ? styles.channelOn : ""}`}
            onClick={() => { setChannel(c.id); setActive(null); }}
            title={c.senderName}
          >
            {initials(c.senderName)}
          </button>
        ))}
      </aside>
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1># {current?.senderName.split(",")[0]}</h1>
            <p>{subtitle}</p>
          </div>
          <button type="button" className={styles.refresh}>↻</button>
        </header>
        <div className={styles.feed}>
          <div className={styles.dayDivider}>Today</div>
          {current?.messages.map((m) => (
            <article key={m.mid} className={styles.msg}>
              <div className={styles.msgAvatar}>{initials(m.senderName)}</div>
              <div>
                <header>
                  <strong>{m.direction === "outgoing" ? "You" : m.senderName.split(",")[0]}</strong>
                  <time>{formatTime(m.receivedAt)}</time>
                </header>
                <p>{m.message}</p>
              </div>
            </article>
          ))}
        </div>
        <footer className={styles.composer}>
          <input placeholder={`Message #${current?.senderName.split(",")[0]}`} />
          <button type="button">Send</button>
        </footer>
      </div>
    </div>
  );
}
