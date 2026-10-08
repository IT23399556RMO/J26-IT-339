/**
 * Creates the database named in DB_NAME if it doesn't exist yet.
 * Connects to the default "postgres" database to do so.
 * Run with: npm run db:create
 */
import "dotenv/config";
import pg from "pg";

const dbName = process.env.DB_NAME;

if (!dbName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
  console.error("❌ DB_NAME is missing or invalid in .env");
  process.exit(1);
}

const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: "postgres",
});

try {
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

  if (rowCount) {
    console.log(`ℹ️  Database "${dbName}" already exists`);
  } else {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Database "${dbName}" created`);
  }
} catch (err) {
  console.error("❌ Failed to create database:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
