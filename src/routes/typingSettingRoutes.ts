import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setTypingSettings } from "../controllers/typingSettingsController"

router.post("/", protect, setTypingSettings)

export default router
