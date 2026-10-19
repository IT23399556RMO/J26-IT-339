import type { Request, Response } from "express";
import pool from "../services/db.js";
import type {
  ApiResponse,
  SearchHistoryItem,
  HistoryResponseData,
} from "../types/index.js";

const MAX_HISTORY_LIMIT = 10;

/**
 * Retrieve the authenticated user's search history and watchlist.
 *
 * Route: GET /api/history
 * Access: Private (Requires Bearer JWT)
 */
export async function getHistory(
  req: Request,
  res: Response<ApiResponse<HistoryResponseData>>,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    const query = `
      SELECT
        id,
        user_id,
        destination_name,
        activity_category,
        target_date,
        suitability_score,
        is_saved,
        created_at
      FROM search_history
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query<SearchHistoryItem>(query, [userId]);
    const items = result.rows;

    const saved = items.filter((item) => item.is_saved);
    const recent = items.filter((item) => !item.is_saved);

    res.status(200).json({
      success: true,
      message: "Search history retrieved successfully.",
      data: {
        saved,
        recent,
        unsavedCount: recent.length,
        maxLimit: MAX_HISTORY_LIMIT,
      },
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving search history.",
    });
  }
}

/**
 * Toggle the saved / watchlist status of a specific history record.
 *
 * Route: PUT /api/history/:id/save
 * Access: Private (Requires Bearer JWT)
 */
export async function toggleSaveStatus(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<SearchHistoryItem>>,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: "History record ID is required.",
      });
      return;
    }

    const query = `
      UPDATE search_history
      SET is_saved = NOT is_saved
      WHERE id = $1 AND user_id = $2
      RETURNING
        id,
        user_id,
        destination_name,
        activity_category,
        target_date,
        suitability_score,
        is_saved,
        created_at;
    `;

    const result = await pool.query<SearchHistoryItem>(query, [id, userId]);

    if (result.rowCount === 0 || !result.rows[0]) {
      res.status(404).json({
        success: false,
        message: "History record not found or access denied.",
      });
      return;
    }

    const updatedItem = result.rows[0];

    // If unsaved, maintain FIFO limit
    if (!updatedItem.is_saved) {
      await pool.query(
        `DELETE FROM search_history
         WHERE user_id = $1
           AND is_saved = false
           AND id NOT IN (
             SELECT id FROM search_history
             WHERE user_id = $1 AND is_saved = false
             ORDER BY created_at DESC
             LIMIT $2
           );`,
        [userId, MAX_HISTORY_LIMIT],
      );
    }

    res.status(200).json({
      success: true,
      message: updatedItem.is_saved
        ? "Destination added to saved watchlist."
        : "Destination removed from saved watchlist.",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error in toggleSaveStatus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating save status.",
    });
  }
}

/**
 * Delete a specific search history / watchlist record.
 *
 * Route: DELETE /api/history/:id
 * Access: Private (Requires Bearer JWT)
 */
export async function deleteRecord(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<{ id: string }>>,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: "History record ID is required.",
      });
      return;
    }

    const query = `
      DELETE FROM search_history
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "History record not found or already deleted.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "History record deleted successfully.",
      data: { id },
    });
  } catch (error) {
    console.error("Error in deleteRecord:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting history record.",
    });
  }
}

/**
 * Clear all unsaved recent searches for the authenticated user.
 * Saved records are preserved.
 *
 * Route: DELETE /api/history/unsaved
 * Access: Private (Requires Bearer JWT)
 */
export async function clearUnsaved(
  req: Request,
  res: Response<ApiResponse<{ clearedCount: number }>>,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User identification missing from token.",
      });
      return;
    }

    const query = `
      DELETE FROM search_history
      WHERE user_id = $1 AND is_saved = false;
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.rowCount ?? 0} unsaved search records.`,
      data: { clearedCount: result.rowCount ?? 0 },
    });
  } catch (error) {
    console.error("Error in clearUnsaved:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while clearing unsaved history.",
    });
  }
}
