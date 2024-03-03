import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getUser } from "../controllers/userController"

router.get("/:username", getUser)

export default router
