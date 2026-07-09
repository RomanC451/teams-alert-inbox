"use client";

import Link from "next/link";
import { useState } from "react";
import type { Conversation } from "@/lib/group-conversations";
import { formatTime, mockConversations } from "@/lib/design-mock-data";
import styles from "./win95.module.css";

export default function Windows95DesignPage() {
  const [active, setActive] = useState<Conversation | null>(null);
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (active) {
    return (
      <>
        <div className={styles.chat}>
          <div className={styles.window}>
            <div className={styles.titleBar}>
              <span>Chat - {active.senderName}</span>
              <button type="button" onClick={() => setActive(null)}>
                ×
              </button>
            </div>
            <div className={styles.body}>
              <div className={styles.messages}>
                {active.messages.map((m) => (
                  <div
                    key={m.mid}
                    className={
                      m.direction === "outgoing" ? styles.msgOut : styles.msgIn
                    }
                  >
                    {m.message}
                  </div>
                ))}
              </div>
              <div className={styles.composer}>
                <input placeholder="Type your message..." />
                <button type="button">Send</button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.taskbar}>
          <span className={styles.start}>Start</span>
          <span className={styles.clock}>{time}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.desktop}>
        <div className={styles.window}>
          <div className={styles.titleBar}>
            <span>Teams Alert Inbox</span>
            <button type="button">×</button>
          </div>
          <div className={styles.body}>
            <Link href="/home" className={styles.back}>
              ← Back
            </Link>
            <div className={styles.list}>
              {mockConversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.item}
                  onClick={() => setActive(c)}
                >
                  <div className={styles.icon} />
                  <div>
                    <strong>{c.senderName}</strong>
                    <div>{c.preview}</div>
                    <div style={{ fontSize: 11, color: "#808080" }}>
                      {formatTime(c.lastMessageAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.clippy}>
              <span className={styles.clippyFace}>📎</span>
              <p style={{ margin: 0, fontSize: 12 }}>
                It looks like you&apos;re having an outage. Would you like help
                sending passive-aggressive replies?
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.taskbar}>
        <span className={styles.start}>Start</span>
        <span className={styles.clock}>{time}</span>
      </div>
    </>
  );
}
