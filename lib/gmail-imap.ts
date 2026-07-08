import { ImapFlow } from "imapflow";
import { decodeQuotedPrintable } from "./email-encoding";
import { parseAlertBody, type TeamsAlert } from "./parse-alert";
function getImapConfig() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const folder = process.env.GMAIL_IMAP_FOLDER ?? "[TEAMS-ALERT]";

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }

  return { user, pass, folder };
}

export async function fetchTeamsAlerts(limit = 50): Promise<TeamsAlert[]> {
  const { user, pass, folder } = getImapConfig();
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const alerts: TeamsAlert[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock(folder);
    try {
      const mailbox = client.mailbox;
      if (!mailbox || mailbox.exists === 0) return [];

      const total = mailbox.exists;
      const start = Math.max(1, total - limit + 1);

      for await (const message of client.fetch(`${start}:*`, {
        uid: true,
        envelope: true,
        source: true,
      })) {
        const source = message.source?.toString("utf8") ?? "";
        const body = extractTextBody(source);
        const from = formatAddress(message.envelope?.from?.[0]);
        const replyTo = formatAddress(message.envelope?.replyTo?.[0]);
        const parsed = parseAlertBody(
          body,
          from,
          replyTo,
          message.envelope?.date?.toISOString()
        );

        if (!parsed.cid || !parsed.mid) continue;

        alerts.push({
          ...parsed,
          direction: "incoming",
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return alerts.reverse();
}

function formatAddress(addr?: { name?: string; address?: string }): string {
  if (!addr?.address) return "";
  if (addr.name) return `"${addr.name}" <${addr.address}>`;
  return addr.address;
}

function extractTextBody(raw: string): string {
  const plain = raw.match(
    /Content-Type: text\/plain[^\r\n]*\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\r\n$)/i
  );
  if (plain?.[1]) return decodeQuotedPrintable(plain[1].trim());

  const idx = raw.indexOf("\r\n\r\n");
  if (idx !== -1) return raw.slice(idx + 4).trim();

  return raw;
}

