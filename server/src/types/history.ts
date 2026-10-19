/**
 * Represents a record in the `search_history` table.
 */
export interface SearchHistoryItem {
  id: string;
  user_id: string;
  destination_name: string;
  activity_category: string;
  target_date: string;
  suitability_score: number;
  is_saved: boolean;
  created_at: string | Date;
}

/**
 * Payload expected when creating a new search history record.
 */
export interface CreateSearchHistoryInput {
  destination_name: string;
  activity_category?: string;
  target_date: string;
  suitability_score: number;
  is_saved?: boolean;
}

/**
 * Structured response for user's history and watchlist.
 */
export interface HistoryResponseData {
  saved: SearchHistoryItem[];
  recent: SearchHistoryItem[];
  unsavedCount: number;
  maxLimit: number;
}

