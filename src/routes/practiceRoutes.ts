import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import {
  createPracticeText,
  getPracticeTexts,
  getPracticeTextById,
} from "../controllers/practiceController"

router.post("/create", protect, createPracticeText)
router.get("/texts", getPracticeTexts)
router.get("/:id", getPracticeTextById)

export default router
