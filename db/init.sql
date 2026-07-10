CREATE TABLE IF NOT EXISTS messages (
  mid TEXT PRIMARY KEY,
  cid TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  chat TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS chat TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS messages_cid_sent_at_idx ON messages (cid, sent_at DESC);

CREATE TABLE IF NOT EXISTS deleted_mids (
  mid TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
