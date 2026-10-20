"use client";

import { useEffect, useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import DataTable, { type TableColumn } from "react-data-table-component";
import AdminHeaderView from "../components/header/header";
import AdminSidebarView from "../components/sidebar/sidebar";
import FooterView from "../../components/footer/footer";
import { useAuth } from "../../context/AuthContext";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const emptySubscribe = () => () => {};

export default function AdminUsersView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, role } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // SSR-safe mounting check via useSyncExternalStore (avoids synchronous setState in effect)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Triggered manually when the user clicks the "Refresh" button
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;

    if (!token) {
      return;
    }

    const loadUsers = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const res = await fetch(`${apiUrl}/api/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!ignore) {
          if (!res.ok) {
            setError(
              data?.message || `Failed to fetch users (${res.status}).`,
            );
          } else if (Array.isArray(data?.data)) {
            setUsers(data.data);
            setError(null);
          } else {
            setUsers([]);
            setError(null);
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while fetching users.",
          );
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      ignore = true;
    };
  }, [token, refreshTrigger]);

  // Filtered users for real-time search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const columns: TableColumn<UserRecord>[] = useMemo(
    () => [
      {
        name: "User",
        selector: (row) => row.name,
        sortable: true,
        cell: (row) => (
          <div className="py-2">
            <p className="font-semibold text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        ),
        grow: 2,
      },
      {
        name: "Role",
        selector: (row) => row.role,
        sortable: true,
        cell: (row) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              row.role === "admin"
                ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40"
            }`}
          >
            {row.role}
          </span>
        ),
        width: "120px",
      },
      {
        name: "User ID",
        selector: (row) => row.id,
        cell: (row) => (
          <span className="font-mono text-xs text-slate-400" title={row.id}>
            {row.id.slice(0, 8)}...{row.id.slice(-4)}
          </span>
        ),
        width: "150px",
      },
      {
        name: "Registered On",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => {
          const date = new Date(row.created_at);
          return (
            <span className="text-xs text-slate-300">
              {isNaN(date.getTime())
                ? row.created_at
                : date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          );
        },
        width: "150px",
      },
    ],
    [],
  );

  // Custom Table Dark Styling
  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
      },
    },
    header: {
      style: {
        backgroundColor: "transparent",
        color: "#ffffff",
      },
    },
    headRow: {
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
        color: "#94a3b8",
        fontSize: "12px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        fontWeight: "700",
      },
    },
    headCells: {
      style: {
        color: "#94a3b8",
      },
    },
    rows: {
      style: {
        backgroundColor: "transparent",
        color: "#f8fafc",
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
        minHeight: "64px",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "transparent",
        color: "#94a3b8",
        borderTopColor: "rgba(255, 255, 255, 0.1)",
      },
      pageButtonsStyle: {
        color: "#94a3b8",
        fill: "#94a3b8",
        "&:disabled": {
          color: "#475569",
          fill: "#475569",
        },
        "&:hover:not(:disabled)": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 font-sans text-white">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <AdminSidebarView open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <AdminHeaderView onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  User Management
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Inspect and manage all registered platform users.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <span className={loading ? "animate-spin" : ""}>🔄</span>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Role Verification Alert if not admin */}
            {role !== "admin" && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200"
              >
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-300">
                    Administrator Access Notice
                  </p>
                  <p className="mt-1 text-amber-200/90">
                    Your current account role is{" "}
                    <span className="font-mono font-bold text-amber-100">
                      {role || "user"}
                    </span>
                    . Fetching users requires an authenticated account with the{" "}
                    <span className="font-bold">admin</span> role.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/home"
                      className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:underline"
                    >
                      ← Return to User Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/15 p-4 text-sm text-rose-200"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">Failed to Load Users</p>
                  <p className="mt-0.5 text-xs text-rose-300">{error}</p>
                </div>
              </div>
            )}

            {/* Table Container Card */}
            <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-white/5 p-6 backdrop-blur-xl sm:p-7">
              {/* Search Toolbar */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or role..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 pl-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-3 text-slate-500"
                  >
                    🔍
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {filteredUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {users.length}
                  </span>{" "}
                  users
                </div>
              </div>

              {/* Data Table */}
              {isMounted && (
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  progressPending={loading}
                  progressComponent={
                    <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                      <span className="mr-2 animate-spin">⚡</span> Loading user records...
                    </div>
                  }
                  noDataComponent={
                    <div className="flex h-36 flex-col items-center justify-center text-sm text-slate-400">
                      <p>No user records found.</p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-xs font-semibold text-purple-400 hover:underline cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                      )}
                    </div>
                  }
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[5, 10, 20, 50]}
                  customStyles={customStyles}
                />
              )}
            </div>
          </div>
        </main>

        <FooterView />
      </div>
    </div>
  );
}