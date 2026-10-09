import { Router } from "express";
import {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public Authentication Routes
router.post("/register", createUser);
router.post("/login", loginUser);

// Protected Profile Operations
router.put("/profile", verifyToken, updateUser);
router.put("/", verifyToken, updateUser);

router.delete("/profile", verifyToken, deleteUser);
router.delete("/", verifyToken, deleteUser);

// Protected Admin Routes (Role-based access)
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/all", verifyToken, isAdmin, getAllUsers);

export default router;

