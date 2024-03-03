import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setTypingSettings, getTypingSettings } from "../controllers/typingSettingsController"

router.post("/", protect, setTypingSettings)
router.get("/", protect, getTypingSettings)

export default router
