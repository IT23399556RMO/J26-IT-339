/** Export all user related types from user model */
export * from "./user.js";

/** Export all environmental preference related types */
export * from "./preferences.js";

/** Export all search history and watchlist related types */
export * from "./history.js";

/** Standard JSON response envelope. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}
