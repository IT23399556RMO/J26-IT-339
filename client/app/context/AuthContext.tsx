"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loginContext: (userData: AuthUser, authToken: string) => void;
  logoutContext: () => void;
  updateUserContext: (updatedData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "travelmate_token";
const USER_KEY = "travelmate_user";
const AUTH_EVENT = "travelmate_auth_changed";

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_EVENT, callback);
  };
}

let cachedUserRaw: string | null = null;
let cachedUserObj: AuthUser | null = null;

function getUserSnapshot(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw !== cachedUserRaw) {
      cachedUserRaw = raw;
      cachedUserObj = raw ? (JSON.parse(raw) as AuthUser) : null;
    }
    return cachedUserObj;
  } catch {
    return null;
  }
}

function getServerUserSnapshot(): AuthUser | null {
  return null;
}

let cachedToken: string | null = null;

function getTokenSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    cachedToken = localStorage.getItem(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
}

function getServerTokenSnapshot(): string | null {
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeAuth,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const token = useSyncExternalStore(
    subscribeAuth,
    getTokenSnapshot,
    getServerTokenSnapshot,
  );

  const notifyChange = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  };

  const loginContext = useCallback((userData: AuthUser, authToken: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      notifyChange();
    } catch (err) {
      console.error("Failed to save auth credentials to localStorage:", err);
    }
  }, []);

  const logoutContext = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      notifyChange();
    } catch (err) {
      console.error("Failed to clear auth credentials from localStorage:", err);
    }
  }, []);

  const updateUserContext = useCallback((updatedData: Partial<AuthUser>) => {
    try {
      const current = getUserSnapshot();
      if (!current) return;
      const updated = { ...current, ...updatedData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      notifyChange();
    } catch (err) {
      console.error("Failed to update user in localStorage:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        name: user?.name ?? null,
        email: user?.email ?? null,
        role: user?.role ?? null,
        isAuthenticated: Boolean(token && user),
        loginContext,
        logoutContext,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
