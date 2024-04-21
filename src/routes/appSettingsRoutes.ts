import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setAppSettings, getAppSettings } from "../controllers/appSettingsController"

router.post("/", protect, setAppSettings)
router.get("/", protect, getAppSettings)

export default router
