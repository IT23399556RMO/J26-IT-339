/** Export all user related types from user model */
export * from "./user.js";

/** Export all environmental preference related types */
export * from "./preferences.js";

/** Standard JSON response envelope. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}
