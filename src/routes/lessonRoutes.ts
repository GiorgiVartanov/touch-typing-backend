import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { createLesson, getLessons, getLesson } from "../controllers/lessonController"

router.post("/create", createLesson)
router.get("/search", getLessons)
router.get("/:id", getLesson)

export default router
