import "dotenv/config";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { User, PublicUser } from "../types/index.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

let isPostgresAvailable = false;
let realPool: Pool | null = null;

try {
  realPool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  realPool.on("error", (err) => {
    if (isPostgresAvailable) {
      console.error("Unexpected PostgreSQL pool error:", err);
    }
  });
} catch {
  realPool = null;
}

function ensureDataFile(): User[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const defaultUsers: User[] = [
        {
          id: "a1111111-1111-1111-1111-111111111111",
          name: "System Administrator",
          email: "admin@travelmate.com",
          password_hash: "$2b$10$eqNMARg7pWlrMtsUD4m4oetvcQBsKRC71Qc/uM2QP1xtl1FNcHqaG",
          role: "admin",
          created_at: new Date("2026-10-19T00:00:00.000Z"),
          updated_at: new Date("2026-10-19T00:00:00.000Z"),
        },
        {
          id: "b2222222-2222-2222-2222-222222222222",
          name: "Tourist User",
          email: "user@travelmate.com",
          password_hash: "$2b$10$Spty7zMy3Vyp6ozjC18Cd.ggaKTkCcwYCt83BaZbar5jlusQ72qLi",
          role: "user",
          created_at: new Date("2026-10-19T00:00:00.000Z"),
          updated_at: new Date("2026-10-19T00:00:00.000Z"),
        },
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
      return defaultUsers;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading users.json:", e);
    return [];
  }
}

function saveUsers(users: User[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving users.json:", e);
  }
}

/**
 * Handle database queries with local JSON fallback
 */
async function localQuery<T extends QueryResultRow = any>(queryText: string, params: any[] = []): Promise<QueryResult<T>> {
  const normalizedQuery = queryText.trim().replace(/\s+/g, " ");

  // SELECT 1 (health check)
  if (/^SELECT 1/i.test(normalizedQuery)) {
    return { rows: [{ "?column?": 1 } as any], rowCount: 1, command: "SELECT", oid: 0, fields: [] };
  }

  const users = ensureDataFile();

  // SELECT id FROM users WHERE LOWER(email) = $1
  if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+LOWER\(email\)\s*=\s*\$1/i.test(normalizedQuery)) {
    const email = String(params[0] ?? "").toLowerCase();
    const found = users.filter((u) => u.email.toLowerCase() === email);
    return { rows: found.map((u) => ({ id: u.id })) as any[], rowCount: found.length, command: "SELECT", oid: 0, fields: [] };
  }

  // SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = $1
  if (/SELECT\s+.*password_hash.*FROM\s+users\s+WHERE\s+LOWER\(email\)\s*=\s*\$1/i.test(normalizedQuery)) {
    const email = String(params[0] ?? "").toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);
    return { rows: user ? [user as any] : [], rowCount: user ? 1 : 0, command: "SELECT", oid: 0, fields: [] };
  }

  // SELECT id, email, password_hash FROM users WHERE id = $1
  if (/SELECT\s+id,\s*email,\s*password_hash\s+FROM\s+users\s+WHERE\s+id\s*=\s*\$1/i.test(normalizedQuery)) {
    const id = String(params[0] ?? "");
    const user = users.find((u) => u.id === id);
    return { rows: user ? [{ id: user.id, email: user.email, password_hash: user.password_hash } as any] : [], rowCount: user ? 1 : 0, command: "SELECT", oid: 0, fields: [] };
  }

  // INSERT INTO users
  if (/^INSERT\s+INTO\s+users/i.test(normalizedQuery)) {
    const [name, email, passwordHash, role] = params;
    const normEmail = String(email).toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normEmail)) {
      const err: any = new Error("User already exists");
      err.code = "23505";
      throw err;
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name: String(name),
      email: String(email),
      password_hash: String(passwordHash),
      role: (role as any) ?? "user",
      created_at: new Date(),
      updated_at: new Date(),
    };
    users.push(newUser);
    saveUsers(users);

    const publicUser: PublicUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
    return { rows: [publicUser as any], rowCount: 1, command: "INSERT", oid: 0, fields: [] };
  }

  // UPDATE users
  if (/^UPDATE\s+users/i.test(normalizedQuery)) {
    const userId = String(params[params.length - 1]);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { rows: [], rowCount: 0, command: "UPDATE", oid: 0, fields: [] };
    }
    const user = users[userIndex]!;
    if (params.length === 2) {
      if (normalizedQuery.includes("name = $1")) {
        user.name = String(params[0]);
      } else if (normalizedQuery.includes("password_hash = $1")) {
        user.password_hash = String(params[0]);
      }
    } else if (params.length === 3) {
      user.name = String(params[0]);
      user.password_hash = String(params[1]);
    }
    user.updated_at = new Date();
    saveUsers(users);

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    return { rows: [publicUser as any], rowCount: 1, command: "UPDATE", oid: 0, fields: [] };
  }

  // DELETE FROM users WHERE id = $1
  if (/^DELETE\s+FROM\s+users\s+WHERE\s+id\s*=\s*\$1/i.test(normalizedQuery)) {
    const id = String(params[0]);
    const filtered = users.filter((u) => u.id !== id);
    saveUsers(filtered);
    return { rows: [], rowCount: 1, command: "DELETE", oid: 0, fields: [] };
  }

  // SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC
  if (/SELECT\s+id,\s*name,\s*email,\s*role,\s*created_at,\s*updated_at\s+FROM\s+users/i.test(normalizedQuery)) {
    const list: PublicUser[] = users
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }));
    return { rows: list as any[], rowCount: list.length, command: "SELECT", oid: 0, fields: [] };
  }

  return { rows: [], rowCount: 0, command: "SELECT", oid: 0, fields: [] };
}

export async function testConnection(): Promise<void> {
  if (realPool) {
    try {
      const client = await realPool.connect();
      try {
        await client.query("SELECT 1");
        isPostgresAvailable = true;
        return;
      } finally {
        client.release();
      }
    } catch {
      isPostgresAvailable = false;
    }
  }
  ensureDataFile();
}

const pool = {
  async query<T extends QueryResultRow = any>(queryText: string, params: any[] = []): Promise<QueryResult<T>> {
    if (isPostgresAvailable && realPool) {
      try {
        return await realPool.query<T>(queryText, params);
      } catch (err) {
        console.warn("Postgres query failed, falling back to local store:", err);
      }
    }
    return localQuery<T>(queryText, params);
  },
  on(event: string, listener: (...args: any[]) => void) {
    if (realPool) (realPool as any).on(event, listener);
  },
};

export default pool;
