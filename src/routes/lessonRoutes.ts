import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { createLesson, getLessons, getFakeWords, getLesson, getFakeWordsIncremental } from "../controllers/lessonController"

router.post("/create", protect, createLesson)
router.get("/search", getLessons)
router.get("/fakewords", getFakeWords)
router.get("/fakewordsIncremental", getFakeWordsIncremental)
router.get("/:id", getLesson)

export default router