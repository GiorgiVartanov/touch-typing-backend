import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { setAppSettings } from "../controllers/appSettingsController"

router.post("/", protect, setAppSettings)

export default router
