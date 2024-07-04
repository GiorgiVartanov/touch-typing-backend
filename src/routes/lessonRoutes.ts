import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getAssessment, getExercise, completeAssessment } from "../controllers/lessonController"

router.get("/exercise", getExercise)
router.get("/assessment", getAssessment)
router.post("/assessment", protect, completeAssessment)

export default router
