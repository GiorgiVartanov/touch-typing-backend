import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import {
  createPracticeText,
  getPracticeTexts,
  getPracticeTextById,
  getFakeWords,
  getWords,
  getSentences,
} from "../controllers/practiceController"

router.post("/create", protect, createPracticeText)
router.get("/texts", getPracticeTexts)
router.get("/fakewords", getFakeWords)
router.get("/words", getWords)
router.get("/sentences", getSentences)
router.get("/:id", getPracticeTextById)

export default router
