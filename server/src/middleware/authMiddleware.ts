import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, ApiResponse } from "../types/index.js";

// Extend Express Request with authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Validates the JWT from the Authorization header (Bearer <token>).
 */
export function verifyToken(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing or malformed.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET ?? "travelmate_jwt_secret_fallback";

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

/**
 * Verifies that the authenticated user possesses the 'admin' role.
 */
export function isAdmin(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access forbidden. Admin role required.",
    });
    return;
  }

  next();
}

