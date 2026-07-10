import { getPool } from "./db";
import type { TeamsAlert } from "./parse-alert";

type MessageRow = {
  mid: string;
  cid: string;
  direction: "incoming" | "outgoing";
  sender_name: string;
  sender_email: string;
  chat: string;
  body: string;
  sent_at: Date;
};

export function rowToAlert(row: MessageRow): TeamsAlert {
  return {
    mid: row.mid,
    cid: row.cid,
    direction: row.direction,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    chat: row.chat,
    message: row.body,
    receivedAt: row.sent_at.toISOString(),
  };
}

function normalizeMessageBody(body: string): string {
  return body.trim();
}

export async function isDuplicateOfLastMessage(
  cid: string,
  body: string
): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ body: string }>(
    `SELECT body FROM messages WHERE cid = $1 ORDER BY sent_at DESC LIMIT 1`,
    [cid]
  );
  const last = result.rows[0]?.body;
  if (last === undefined) return false;
  return normalizeMessageBody(last) === normalizeMessageBody(body);
}

async function tombstoneMid(mid: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO deleted_mids (mid) VALUES ($1) ON CONFLICT (mid) DO NOTHING`,
    [mid]
  );
}

export async function upsertMessage(alert: TeamsAlert): Promise<void> {
  if (await isMidDeleted(alert.mid)) return;

  if (await isDuplicateOfLastMessage(alert.cid, alert.message)) {
    await tombstoneMid(alert.mid);
    return;
  }

  const pool = getPool();
  await pool.query(
    `INSERT INTO messages (mid, cid, direction, sender_name, sender_email, chat, body, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (mid) DO UPDATE SET
       cid = EXCLUDED.cid,
       sender_name = EXCLUDED.sender_name,
       sender_email = EXCLUDED.sender_email,
       chat = EXCLUDED.chat,
       body = EXCLUDED.body,
       sent_at = EXCLUDED.sent_at`,
    [
      alert.mid,
      alert.cid,
      alert.direction,
      alert.senderName,
      alert.senderEmail,
      alert.chat,
      alert.message,
      alert.receivedAt,
    ]
  );
}

export async function upsertMessages(alerts: TeamsAlert[]): Promise<number> {
  if (alerts.length === 0) return 0;

  const pool = getPool();
  const mids = alerts.map((alert) => alert.mid);
  const deleted = await pool.query<{ mid: string }>(
    `SELECT mid FROM deleted_mids WHERE mid = ANY($1::text[])`,
    [mids]
  );
  const deletedMids = new Set(deleted.rows.map((row) => row.mid));

  let inserted = 0;

  for (const alert of alerts) {
    if (deletedMids.has(alert.mid)) continue;

    if (await isDuplicateOfLastMessage(alert.cid, alert.message)) {
      await tombstoneMid(alert.mid);
      continue;
    }

    const result = await pool.query(
      `INSERT INTO messages (mid, cid, direction, sender_name, sender_email, chat, body, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (mid) DO UPDATE SET
         cid = EXCLUDED.cid,
         sender_name = EXCLUDED.sender_name,
         sender_email = EXCLUDED.sender_email,
         chat = EXCLUDED.chat,
         body = EXCLUDED.body,
         sent_at = EXCLUDED.sent_at`,
      [
        alert.mid,
        alert.cid,
        alert.direction,
        alert.senderName,
        alert.senderEmail,
        alert.chat,
        alert.message,
        alert.receivedAt,
      ]
    );
    inserted += result.rowCount ?? 0;
  }

  return inserted;
}

export async function listMessages(limit = 500): Promise<TeamsAlert[]> {
  const pool = getPool();
  const result = await pool.query<MessageRow>(
    `SELECT mid, cid, direction, sender_name, sender_email, chat, body, sent_at
     FROM messages
     ORDER BY sent_at ASC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(rowToAlert);
}

export async function insertOutgoingMessage(
  alert: Omit<TeamsAlert, "direction">
): Promise<TeamsAlert> {
  const message: TeamsAlert = { ...alert, direction: "outgoing" };
  await upsertMessage(message);
  return message;
}

export async function deleteConversationByCid(cid: string): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const mids = await client.query<{ mid: string }>(
      `SELECT mid FROM messages WHERE cid = $1`,
      [cid]
    );

    for (const row of mids.rows) {
      await client.query(
        `INSERT INTO deleted_mids (mid) VALUES ($1) ON CONFLICT (mid) DO NOTHING`,
        [row.mid]
      );
    }

    const deleted = await client.query(`DELETE FROM messages WHERE cid = $1`, [
      cid,
    ]);

    await client.query("COMMIT");
    return deleted.rowCount ?? 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function isMidDeleted(mid: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT 1 FROM deleted_mids WHERE mid = $1 LIMIT 1`,
    [mid]
  );
  return (result.rowCount ?? 0) > 0;
}
