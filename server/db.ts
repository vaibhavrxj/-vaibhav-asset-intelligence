import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import pg from "pg";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import * as schemaSqlite from "@shared/schema-sqlite";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isFileDb = process.env.DATABASE_URL.startsWith("file:");

let db: any;
let pool: any;

if (isFileDb) {
  const dbPath = process.env.DATABASE_URL.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });
  pool = null; // Not used for SQLite
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db, pool };
