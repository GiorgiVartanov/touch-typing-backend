import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getUser, getUsers, incrementLayoutCounter } from "../controllers/userController"

router.get("/search", getUsers)
router.post("/incrementLayoutCounter", incrementLayoutCounter)
router.get("/:username", getUser)

export default router
