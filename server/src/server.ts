import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { testConnection } from "./services/db.js";
import userRoutes from "./routes/userRoutes.js";
import type { ApiResponse } from "./types/index.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5001);
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

// ---------- Middleware ----------
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// ---------- Routes ----------
app.use("/api/users", userRoutes);

app.get("/api/health", async (_req: Request, res: Response<ApiResponse>) => {
  try {
    await testConnection();
    res.json({ success: true, message: "Server and database are running" });
  } catch {
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

// ---------- Start ----------
async function start() {
  try {
    await testConnection();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ Could not connect to PostgreSQL:", (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();

