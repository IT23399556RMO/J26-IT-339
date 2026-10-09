/** Export all user related types from user modal */
export * from './user.js';

/** Standard JSON response envelope. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
