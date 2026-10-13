import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../services/db.js";
import type { ApiResponse, PublicUser, User, UserRole } from "../types/index.js";

interface CreateUserRequestBody {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

interface LoginUserRequestBody {
  email?: string;
  password?: string;
}

interface UpdateUserRequestBody {
  name?: string;
  password?: string;
}

interface DeleteUserRequestBody {
  email?: string;
  password?: string;
}

interface AuthResponseData {
  user: PublicUser;
  token: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "travelmate_jwt_secret_fallback";

/**
 * Register a new user with default role 'user' (or 'admin' if explicitly specified).
 */
export async function createUser(
  req: Request<unknown, unknown, CreateUserRequestBody>,
  res: Response<ApiResponse<AuthResponseData>>,
): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole: UserRole = role === "admin" ? "admin" : "user";

    // Check if user already exists
    const existing = await pool.query<User>(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );

    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into PostgreSQL
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const result = await pool.query<PublicUser>(insertQuery, [
      trimmedName,
      normalizedEmail,
      passwordHash,
      assignedRole,
    ]);

    const createdUser = result.rows[0];
    if (!createdUser) {
      res.status(500).json({
        success: false,
        message: "Failed to create user record.",
      });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: createdUser,
        token,
      },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
      return;
    }

    console.error("Error in createUser:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating user.",
    });
  }
}

/**
 * Log in an existing user with email and password.
 */
export async function loginUser(
  req: Request<unknown, unknown, LoginUserRequestBody>,
  res: Response<ApiResponse<AuthResponseData>>,
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userResult = await pool.query<User>(
      "SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = $1",
      [normalizedEmail],
    );

    const user = userResult.rows[0];
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // Sign JWT with role included
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: publicUser,
        token,
      },
    });
  } catch (err: unknown) {
    console.error("Error in loginUser:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during login.",
    });
  }
}

/**
 * Update the authenticated user's name and/or password.
 */
export async function updateUser(
  req: Request<unknown, unknown, UpdateUserRequestBody>,
  res: Response<ApiResponse<{ user: PublicUser }>>,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { name, password } = req.body;

    if (!name?.trim() && !password) {
      res.status(400).json({
        success: false,
        message: "Please provide a new name or password to update.",
      });
      return;
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (name && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long.",
        });
        return;
      }
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    updates.push(`updated_at = current_timestamp`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query<PublicUser>(query, values);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (err: unknown) {
    console.error("Error in updateUser:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile.",
    });
  }
}

/**
 * Delete the authenticated user's account after confirming email and password.
 */
export async function deleteUser(
  req: Request<unknown, unknown, DeleteUserRequestBody>,
  res: Response<ApiResponse>,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required to confirm account deletion.",
      });
      return;
    }

    // Fetch user from DB to verify identity
    const userResult = await pool.query<User>(
      "SELECT id, email, password_hash FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    // Verify email match
    if (user.email.toLowerCase() !== email.trim().toLowerCase()) {
      res.status(401).json({
        success: false,
        message: "Provided email does not match your account.",
      });
      return;
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
      return;
    }

    // Delete user
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.status(200).json({
      success: true,
      message: "User account deleted successfully.",
    });
  } catch (err: unknown) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting user.",
    });
  }
}

/**
 * Fetch all registered users (Admin only).
 */
export async function getAllUsers(
  _req: Request,
  res: Response<ApiResponse<PublicUser[]>>,
): Promise<void> {
  try {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query<PublicUser>(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err: unknown) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching users.",
    });
  }
}

