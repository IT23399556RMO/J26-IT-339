/**
 * Client service for Search History & Watchlist operations.
 * Communicates with the Node.js backend history endpoints.
 */

export interface HistoryItem {
  id: string;
  user_id: string;
  destination_name: string;
  activity_category: string;
  target_date: string;
  suitability_score: number;
  is_saved: boolean;
  created_at: string;
}

export interface HistoryData {
  saved: HistoryItem[];
  recent: HistoryItem[];
  unsavedCount: number;
  maxLimit: number;
}

const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * Fetch all saved watchlist destinations and recent searches for authenticated user.
 */
export async function fetchHistory(token: string): Promise<HistoryData> {
  const res = await fetch(`${getBaseUrl()}/api/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch history (Status ${res.status})`);
  }

  const json = await res.json();
  return json.data ?? { saved: [], recent: [], unsavedCount: 0, maxLimit: 10 };
}

/**
 * Toggle the saved / watchlist status of a history record.
 */
export async function toggleSaveHistory(
  id: string,
  token: string,
): Promise<HistoryItem> {
  const res = await fetch(`${getBaseUrl()}/api/history/${id}/save`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle save status (Status ${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Delete a specific history or saved record.
 */
export async function deleteHistoryItem(
  id: string,
  token: string,
): Promise<boolean> {
  const res = await fetch(`${getBaseUrl()}/api/history/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete history item (Status ${res.status})`);
  }

  return true;
}

/**
 * Clear all unsaved recent searches (retaining saved watchlist items).
 */
export async function clearUnsavedHistory(token: string): Promise<number> {
  const res = await fetch(`${getBaseUrl()}/api/history/unsaved`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to clear unsaved history (Status ${res.status})`);
  }

  const json = await res.json();
  return json.data?.clearedCount ?? 0;
}
