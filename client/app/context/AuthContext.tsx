"use client";

import {
  createContext,
  useContext,
  useState,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Failed to restore user from localStorage:", err);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (err) {
      console.error("Failed to restore token from localStorage:", err);
      return null;
    }
  });

  const loginContext = (userData: AuthUser, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    try {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to save auth credentials to localStorage:", err);
    }
  };

  const logoutContext = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error("Failed to clear auth credentials from localStorage:", err);
    }
  };

  const updateUserContext = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update user in localStorage:", err);
      }
      return updated;
    });
  };

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

