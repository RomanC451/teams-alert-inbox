import Link from "next/link";
import { refinedConcepts, wildConcepts } from "@/lib/design-concepts";
import type { DesignConcept } from "@/lib/design-concepts";
import styles from "./home.module.css";

function ConceptGrid({ items }: { items: DesignConcept[] }) {
  return (
    <div className={styles.grid}>
      {items.map((c) => (
        <Link key={c.href} href={c.href} className={styles.card}>
          <div
            className={styles.cardIcon}
            style={{
              background: `${c.accent}22`,
              border: `1px solid ${c.accent}55`,
            }}
          >
            {c.emoji}
          </div>
          <div>
            <p className={styles.cardTitle}>{c.title}</p>
            <p className={styles.cardVibe}>{c.vibe}</p>
          </div>
          <span className={styles.arrow}>›</span>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.logo}>T</div>
        <h1 className={styles.title}>Teams Alert Inbox</h1>
        <p className={styles.subtitle}>
          Your alert command center. Open the inbox or explore redesign concepts.
        </p>
      </header>

      <Link href="/" className={styles.primaryCta}>
        Open Inbox →
      </Link>

      <section className={styles.section} id="refined">
        <h2 className={styles.sectionTitle}>Refined variants</h2>
        <p className={styles.sectionSub}>
          Product-inspired layouts — iMessage, Slack, Telegram, Linear, Gmail
        </p>
        <ConceptGrid items={refinedConcepts} />
      </section>

      <section className={styles.section} id="wild">
        <h2 className={styles.sectionTitle}>Wild concepts</h2>
        <p className={styles.sectionSub}>
          Experimental ideas — probably not for production
        </p>
        <ConceptGrid items={wildConcepts} />
      </section>

      <footer className={styles.footer}>
        Production app at <Link href="/">/</Link>
      </footer>
    </main>
  );
}
