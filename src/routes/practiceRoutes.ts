import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import {
  createPracticeText,
  getPracticeTexts,
  getPracticeTextById,
  getFakeWords,
  // getWords,
} from "../controllers/practiceController"

router.post("/create", protect, createPracticeText)
router.get("/texts", getPracticeTexts)
router.get("/:id", getPracticeTextById)
router.get("/fakewords", getFakeWords)
// router.get("/words", getWords)

export default router
