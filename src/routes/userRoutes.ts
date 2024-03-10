import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getUser, getUsers } from "../controllers/userController"

router.get("/search", getUsers)
router.get("/:username", getUser)

export default router
