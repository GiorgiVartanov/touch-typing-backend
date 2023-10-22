import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { loginUser, registerUser } from "../controllers/authController"

router.post("/login", loginUser)
router.post("/register", registerUser)

export default router
