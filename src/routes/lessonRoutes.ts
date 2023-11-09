import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { createLesson, getLessons, getFakeWords, getLesson, getSpecificTraining } from "../controllers/lessonController"

router.post("/create", protect, createLesson)
router.get("/search", getLessons)
router.get("/fakewords", getFakeWords)
router.get("/spectrain", getSpecificTraining)
router.get("/:id", getLesson)

export default router
