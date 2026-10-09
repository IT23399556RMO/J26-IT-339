export type UserRole = "user" | "admin";

/** Row shape of the `users` table. */
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/** Payload stored inside the JWT token. */
export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** User data that is safe to send to the client (no password hash). */
export type PublicUser = Omit<User, "password_hash">;