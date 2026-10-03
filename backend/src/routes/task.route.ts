import { Router } from "express";

import {
    getTask,
    updateTask,
    deleteTask,
    attachLabel,
    removeLabel,
    getAllTasks,
} from "../controllers/task.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAllTasks);
router.get("/:id", authMiddleware, getTask);
router.patch("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

router.post("/:taskId/labels/:labelId", authMiddleware, attachLabel);
router.delete("/:taskId/labels/:labelId", authMiddleware, removeLabel);

export default router;