import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, "..", "db", "init.sql"),
  "utf8"
);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('messages', 'deleted_mids')
     ORDER BY table_name`
  );
  console.log("Migration OK");
  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await pool.end();
}
