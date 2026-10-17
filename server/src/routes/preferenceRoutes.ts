import { Router } from "express";
import {
  upsertPreferences,
  getPreferences,
  evaluateSuitability,
} from "../controllers/preferenceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all preference routes with verifyToken middleware
router.use(verifyToken);

router.get("/", getPreferences);
router.post("/", upsertPreferences);
router.post("/evaluate", evaluateSuitability);

export default router;
