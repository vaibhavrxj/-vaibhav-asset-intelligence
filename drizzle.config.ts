import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isFileDb = process.env.DATABASE_URL.startsWith("file:");

export default defineConfig({
  out: "./migrations",
  schema: isFileDb ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isFileDb ? "sqlite" : "postgresql",
  dbCredentials: isFileDb 
    ? { url: process.env.DATABASE_URL.replace("file:", "") }
    : { url: process.env.DATABASE_URL },
});
