import { Router } from "express";
import {
  getHistory,
  toggleSaveStatus,
  deleteRecord,
  clearUnsaved,
} from "../controllers/historyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all history routes with verifyToken middleware
router.use(verifyToken);

router.get("/", getHistory);
router.put("/:id/save", toggleSaveStatus);
router.delete("/unsaved", clearUnsaved);
router.delete("/:id", deleteRecord);

export default router;
