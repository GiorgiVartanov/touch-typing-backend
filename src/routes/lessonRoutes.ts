import express, { Router } from "express"

const router: Router = express.Router()

import { getAssessment, getExercise } from "../controllers/lessonController"

router.get("/exercise", getExercise)
router.get("/assessment", getAssessment)

export default router
