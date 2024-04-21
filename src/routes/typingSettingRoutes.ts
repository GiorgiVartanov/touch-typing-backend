import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setTypingSettings, getTypingSettings, setLayout } from "../controllers/typingSettingsController"

router.post("/", protect, setTypingSettings)
router.get("/", protect, getTypingSettings)
router.post("/layout", protect, setLayout)

export default router
