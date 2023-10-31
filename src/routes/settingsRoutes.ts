import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setSettings } from "../controllers/settingsController"

router.post("/", protect, setSettings)

export default router
